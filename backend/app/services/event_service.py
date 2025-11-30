from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import or_, and_, func
from fastapi import HTTPException, status
from app.db.models.event import Event, EventMaterial, EventType
from app.db.models.user import User
from app.schemas.event import EventCreate, EventUpdate
from sqlalchemy.orm import joinedload, selectinload
from typing import List, Optional
from app.db.models.user import UserRole
from app.db.models.inscription import Inscription

async def check_conflict(
    db: AsyncSession, 
    start: datetime, 
    end: datetime, 
    location: str, 
    host: str,
    event_id_to_ignore: int = None
):
    """
    Verifica se há um evento conflitante (mesmo local E horário 
    OU mesmo host E horário).
    """

    time_overlap = and_(
        Event.start_time < end,
        Event.end_time > start
    )

    location_or_host_overlap = or_(
        Event.location == location,
        Event.host == host
    )

    query = select(Event).where(
        time_overlap,
        location_or_host_overlap
    )


    if event_id_to_ignore:
        query = query.where(Event.id != event_id_to_ignore)

    result = await db.execute(query)
    conflicting_event = result.scalars().first()

    if conflicting_event:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail=f"Conflito de horário/local/host com o evento: {conflicting_event.title}"
        )

async def create_event(
    db: AsyncSession, event_in: EventCreate, creator: User
) -> Event:
    """
    Cria um novo evento no banco de dados.
    """
    await check_conflict(
        db, 
        event_in.start_time, 
        event_in.end_time, 
        event_in.location, 
        event_in.host
    )

    db_materials = [
        EventMaterial(title=mat.title, url_or_filename=mat.url_or_filename)
        for mat in event_in.materials
    ]

    new_event = Event(
        **event_in.model_dump(exclude={"materials"}), 
        creator_id=creator.id,
        materials=db_materials 
    )

    db.add(new_event)
    await db.commit()
    
    query = (
        select(Event)
        .where(Event.id == new_event.id)
        .options(joinedload(Event.materials),
                 selectinload(Event.inscriptions))
    )
    result = await db.execute(query)
    created_event = result.scalars().first()

    return created_event

async def get_events(
    db: AsyncSession,
    user: Optional[User],
    event_type: Optional[EventType] = None,
    title: Optional[str] = None
) -> List[Event]:
    """
    Busca todos os eventos com filtros, aplicando regras de visibilidade.
    """
    query = select(Event).options(
        joinedload(Event.materials), 
        selectinload(Event.inscriptions)
    )

    if not user or user.role == UserRole.participant:
        query = query.where(Event.is_public == True)

    if event_type:
        query = query.where(Event.event_type == event_type)

    if title:
        query = query.where(Event.title.ilike(f"%{title}%")) 

    query = query.order_by(Event.start_time.desc())

    result = await db.execute(query)
    return result.scalars().unique().all()


async def get_event_by_id(
    db: AsyncSession, event_id: int, user: Optional[User]
) -> Event:
    """
    Busca um único evento pelo ID, aplicando regras de visibilidade.
    """
    query = (
        select(Event)
        .where(Event.id == event_id)
        .options(
            joinedload(Event.materials),
            selectinload(Event.inscriptions)
        )
    )

    result = await db.execute(query)
    event = result.scalars().first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Evento não encontrado"
        )

    if not event.is_public:
        if not user or user.role not in [UserRole.admin, UserRole.organizer]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento não encontrado"
            )

    return event

async def update_event(
    db: AsyncSession, 
    event_id: int, 
    event_in: EventUpdate,
    user: User
) -> Event:
    """
    Atualiza um evento.
    """
    db_event = await db.get(Event, event_id)
    
    if not db_event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    if db_event.creator_id != user.id and user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Sem permissão para editar")

    update_data = event_in.model_dump(exclude_unset=True)

    await check_conflict(
        db,
        start=update_data.get("start_time", db_event.start_time),
        end=update_data.get("end_time", db_event.end_time),
        location=update_data.get("location", db_event.location),
        host=update_data.get("host", db_event.host),
        event_id_to_ignore=event_id
    )

    for key, value in update_data.items():
        setattr(db_event, key, value)
        
    await db.commit()

    query = (
        select(Event)
        .where(Event.id == event_id)
        .options(
            joinedload(Event.materials),
            selectinload(Event.inscriptions)
        )
    )
    result = await db.execute(query)
    return result.scalars().first()

async def delete_event(
    db: AsyncSession, event_id: int, user: User
):
    """
    Deleta um evento.
    """
    db_event = await db.get(Event, event_id)
    
    if not db_event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
        
    if db_event.creator_id != user.id and user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Sem permissão para deletar")
        
    await db.delete(db_event)
    await db.commit()
    return

async def get_dashboard_stats(db: AsyncSession, user_id: int):
    """
    Retorna estatísticas gerais para o dashboard do organizador (RF26).
    """
    query_events = select(func.count(Event.id)).where(Event.creator_id == user_id)
    result_events = await db.execute(query_events)
    total_events = result_events.scalar() or 0

    query_inscriptions = (
        select(func.count(Inscription.id))
        .join(Event)
        .where(Event.creator_id == user_id)
    )
    result_inscriptions = await db.execute(query_inscriptions)
    total_inscriptions = result_inscriptions.scalar() or 0

    return {
        "total_events": total_events,
        "total_inscriptions": total_inscriptions
    }
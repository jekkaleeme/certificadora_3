from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.base import get_db
from app.db.models.user import User
from app.db.models.event import EventType
from app.schemas.event import EventCreate, EventRead
from app.services import event_service
from app.api.deps import get_current_organizer_user, get_current_user_optional

router = APIRouter()

@router.post(
    "/events",
    response_model=EventRead,
    status_code=201
)
async def create_new_event(
    event_in: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_organizer_user)
):
    """
    Cria um novo evento. 
    Acessível apenas para Organizadores e Administradores.
    """
    new_event = await event_service.create_event(
        db=db, event_in=event_in, creator=current_user
    )
    return new_event

@router.get(
    "/events/{event_id}",
    response_model=EventRead
)
async def get_event_details(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Retorna os detalhes de um evento específico.
    Eventos privados só são visíveis para organizadores/admins.
    """
    event = await event_service.get_event_by_id(
        db=db, event_id=event_id, user=current_user
    )
    return event

@router.get(
    "/events",
    response_model=List[EventRead]
)
async def get_all_events(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),

    event_type: Optional[EventType] = None,
    title: Optional[str] = None
):
    """
    Retorna uma lista de eventos, com filtros.
    Eventos privados só são visíveis para organizadores/admins.
    """
    events = await event_service.get_events(
        db=db, user=current_user, event_type=event_type, title=title
    )
    return events
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import func
from fastapi import HTTPException, status

from app.db.models.inscription import Inscription
from app.db.models.event import Event
from app.db.models.user import User
from app.schemas.inscription import InscriptionCreate

async def create_inscription(
    db: AsyncSession, 
    event_id: int, 
    inscription_in: InscriptionCreate,
    current_user: User | None 
) -> Inscription:
    """
    Realiza a inscrição em um evento, checando vagas e duplicidade.
    """
    query = select(Event).where(Event.id == event_id).options(selectinload(Event.inscriptions))
    result = await db.execute(query)
    event = result.scalars().first()

    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    current_count = len(event.inscriptions)
    
    if event.max_vacancies > 0 and current_count >= event.max_vacancies:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Vagas esgotadas para este evento."
        )

    user_id = None
    email_to_check = None

    final_guest_name = None
    final_guest_email = None
    final_guest_phone = None

    if current_user:
        user_id = current_user.id
        email_to_check = current_user.email
        
        final_guest_name = None
        final_guest_email = None
        final_guest_phone = None
    else:
        if not inscription_in.guest_email or not inscription_in.guest_name:
            raise HTTPException(
                status_code=400, 
                detail="Visitantes devem fornecer nome e e-mail."
            )
        email_to_check = inscription_in.guest_email

        final_guest_name = inscription_in.guest_name
        final_guest_email = inscription_in.guest_email
        final_guest_phone = inscription_in.guest_phone

    existing_query = select(Inscription).where(
        Inscription.event_id == event_id
    )
    
    result = await db.execute(existing_query)
    inscriptions = result.scalars().all()
    
    for insc in inscriptions:
        if user_id and insc.user_id == user_id:
             raise HTTPException(status_code=400, detail="Você já está inscrito neste evento.")
        if insc.guest_email == email_to_check:
             raise HTTPException(status_code=400, detail="Este e-mail já está inscrito.")

    new_inscription = Inscription(
        event_id=event_id,
        user_id=user_id,
        guest_name=final_guest_name,
        guest_email=final_guest_email,
        guest_phone=final_guest_phone
    )

    db.add(new_inscription)
    await db.commit()
    query = (
        select(Inscription)
        .where(Inscription.id == new_inscription.id)
        .options(joinedload(Inscription.user)) # Carrega o usuário junto
    )
    result = await db.execute(query)
    final_inscription = result.scalars().first()
    
    return final_inscription

async def get_event_inscriptions(db: AsyncSession, event_id: int):
    """Lista todos os inscritos de um evento."""
    query = (
        select(Inscription)
        .where(Inscription.event_id == event_id)
        .options(joinedload(Inscription.user))
    )
    result = await db.execute(query)
    return result.scalars().all()

async def check_in_participant(db: AsyncSession, inscription_id: int):
    """Marca a presença (check-in) de um inscrito."""
    query = (
        select(Inscription)
        .where(Inscription.id == inscription_id)
        .options(joinedload(Inscription.user))
    )
    result = await db.execute(query)
    inscription = result.scalars().first()
    
    if not inscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Inscrição não encontrada"
        )
        
    inscription.checked_in = True
    
    db.add(inscription)
    await db.commit()
    
    return inscription
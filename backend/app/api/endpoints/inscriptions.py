from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.base import get_db
from app.db.models.user import User
from app.schemas.inscription import InscriptionCreate, InscriptionRead
from app.services import inscription_service
from app.api.deps import get_current_user_optional, get_current_organizer_user

router = APIRouter()

@router.post("/events/{event_id}/inscribe", response_model=InscriptionRead, status_code=201)
async def inscribe_in_event(
    event_id: int,
    inscription_in: InscriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    """
    Realiza a inscrição em um evento.
    - Se logado: usa os dados do usuário.
    - Se visitante: exige nome e email no corpo da requisição.
    """
    inscription = await inscription_service.create_inscription(
        db=db, 
        event_id=event_id, 
        inscription_in=inscription_in, 
        current_user=current_user
    )
    return inscription

@router.get("/events/{event_id}/inscriptions", response_model=List[InscriptionRead])
async def list_inscriptions(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_organizer_user)
):
    """
    Lista todos os inscritos de um evento (Apenas Organizadores/Admins).
    """
    inscriptions = await inscription_service.get_event_inscriptions(db, event_id)
    return inscriptions

@router.put("/inscriptions/{inscription_id}/checkin", response_model=InscriptionRead)
async def check_in(
    inscription_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_organizer_user) 
):
    """Realiza o check-in de um participante (Apenas Organizadores)."""
    inscription = await inscription_service.check_in_participant(db, inscription_id)
    return inscription
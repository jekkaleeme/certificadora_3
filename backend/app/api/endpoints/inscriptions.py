from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.base import get_db
from app.db.models.user import User
from app.db.models.inscription import Inscription
from app.schemas.inscription import InscriptionCreate, InscriptionRead
from app.schemas.user import UserRole
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

@router.delete("/inscriptions/{inscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_inscription(
    inscription_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Cancela uma inscrição.
    O usuário só pode cancelar sua própria inscrição (ou ser admin).
    """
    # Busca a inscrição
    result = await db.execute(select(Inscription).where(Inscription.id == inscription_id))
    inscription = result.scalars().first()

    if not inscription:
        raise HTTPException(status_code=404, detail="Inscrição não encontrada.")

    # Verifica permissão
    if not current_user:
         raise HTTPException(status_code=401, detail="Autenticação necessária para cancelar.")

    # Regra: Só pode cancelar se for o dono ou admin
    # Nota: Comparamos com UserRole.admin ou string "admin" dependendo da sua implementação de Enum
    is_admin = current_user.role == UserRole.admin if hasattr(UserRole, 'admin') else current_user.role == "admin"
    
    if current_user.id != inscription.user_id and not is_admin:
         raise HTTPException(status_code=403, detail="Sem permissão para cancelar esta inscrição.")

    await db.delete(inscription)
    await db.commit()
    return None
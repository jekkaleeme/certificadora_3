from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.base import get_db
from app.db.models.rating import Rating  # Assumindo que você criará o model
from app.db.models.user import User
from app.schemas.rating import RatingCreate, RatingRead
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=RatingRead, status_code=201)
async def create_rating(
    rating_in: RatingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria uma nova avaliação para um evento.
    """
    # Verifica se o usuário tentando avaliar é o mesmo do token
    if rating_in.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Você não pode avaliar em nome de outro usuário.")

    new_rating = Rating(
        event_id=rating_in.event_id,
        user_id=rating_in.user_id,
        rating=rating_in.rating,
        comment=rating_in.comment
    )
    
    db.add(new_rating)
    await db.commit()
    await db.refresh(new_rating)
    return new_rating

@router.get("/event/{event_id}", response_model=List[RatingRead])
async def get_event_ratings(
    event_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todas as avaliações de um evento específico.
    """
    # Exemplo de query direta (sem service, para ser mais rápido de implementar)
    result = await db.execute(select(Rating).where(Rating.event_id == event_id))
    ratings = result.scalars().all()
    return ratings
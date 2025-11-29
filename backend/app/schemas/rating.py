from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# O que o front envia para criar
class RatingCreate(BaseModel):
    event_id: int
    user_id: int
    rating: int
    comment: Optional[str] = None

# O que o back devolve para o front
class RatingRead(RatingCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
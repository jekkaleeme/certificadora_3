from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base import Base

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer, nullable=False) # 1 a 5 estrelas
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Chaves Estrangeiras
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)

    # Relacionamentos (Opcional, se você quiser acessar user.ratings ou event.ratings)
    # user = relationship("User", back_populates="ratings")
    # event = relationship("Event", back_populates="ratings")
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Inscription(Base):
    __tablename__ = "inscriptions"
    
    id = Column(Integer, primary_key=True, index=True)

    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    guest_name = Column(String(100), nullable=True)
    guest_email = Column(String(100), nullable=True)
    guest_phone = Column(String(20), nullable=True)

    registration_time = Column(DateTime(timezone=True), server_default=func.now())
    checked_in = Column(Boolean, default=False) # RF21

    event = relationship("Event", back_populates="inscriptions")
    user = relationship("User", back_populates="inscriptions")

    __table_args__ = (
        UniqueConstraint('event_id', 'user_id', name='uq_event_user'),
    )

    @property
    def user_name(self):
        if self.user:
            return self.user.name
        return self.guest_name

    @property
    def user_email(self):
        if self.user:
            return self.user.email
        return self.guest_email
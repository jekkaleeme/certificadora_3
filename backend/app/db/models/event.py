import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class EventType(str, enum.Enum):
    oficina = "oficina"
    palestra = "palestra"
    reuniao_interna = "reuniao_interna"

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), index=True, nullable=False)
    description = Column(Text, nullable=True)

    event_type = Column(Enum(EventType), nullable=False) 

    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    location = Column(String(200), nullable=True)
    host = Column(String(100), nullable=True)

    max_vacancies = Column(Integer, default=0) 

    is_public = Column(Boolean, default=True) 

    creator_id = Column(Integer, ForeignKey("users.id"))
    creator = relationship("User")

    materials = relationship("EventMaterial", back_populates="event", cascade="all, delete-orphan")

class EventMaterial(Base):
    __tablename__ = "event_materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    url_or_filename = Column(String(500), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"))

    event = relationship("Event", back_populates="materials")
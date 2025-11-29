from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.db.models.event import EventType

class EventMaterialBase(BaseModel):
    title: str
    url_or_filename: str

class EventMaterialCreate(EventMaterialBase):
    pass

class EventMaterialRead(EventMaterialBase):
    id: int
    class Config:
        from_attributes = True

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: EventType
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    host: Optional[str] = None
    max_vacancies: Optional[int] = 0
    is_public: Optional[bool] = True

class EventCreate(EventBase):
    materials: List[EventMaterialCreate] = []

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    host: Optional[str] = None
    max_vacancies: Optional[int] = None
    is_public: Optional[bool] = None

class EventRead(EventBase):
    id: int
    creator_id: int
    materials: List[EventMaterialRead] = []
    inscriptions_count: int = 0  

    class Config:
        from_attributes = True
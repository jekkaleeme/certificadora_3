from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class InscriptionBase(BaseModel):
    guest_name: Optional[str] = None
    guest_email: Optional[EmailStr] = None
    guest_phone: Optional[str] = None

class InscriptionCreate(InscriptionBase):
    pass

class InscriptionRead(InscriptionBase):
    id: int
    event_id: int
    user_id: Optional[int] = None
    registration_time: datetime
    checked_in: bool
    
    user_name: Optional[str] = None 
    user_email: Optional[str] = None

    class Config:
        from_attributes = True
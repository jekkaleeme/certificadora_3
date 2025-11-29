from pydantic import BaseModel, EmailStr
from typing import Optional
from app.db.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str 
    role: UserRole = UserRole.participant 

class UserRead(UserBase):
    id: int
    role: UserRole

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
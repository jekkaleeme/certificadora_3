import enum
from sqlalchemy import Column, Integer, String, Enum
from app.db.base import Base
from sqlalchemy.orm import relationship 

class UserRole(str, enum.Enum):
    participant = "participant"
    organizer = "organizer"
    admin = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True) 
    hashed_password = Column(String, nullable=False)
    
    role = Column(Enum(UserRole), nullable=False, default=UserRole.participant)

    inscriptions = relationship(
        "Inscription", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
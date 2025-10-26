from fastapi import APIRouter
from app.api.endpoints import users
from app.api.endpoints import auth
from app.api.endpoints import events

api_router = APIRouter()
api_router.include_router(users.router, prefix="/v1", tags=["Users"])
api_router.include_router(auth.router, prefix="/v1", tags=["Authentication"])
api_router.include_router(events.router, prefix="/v1", tags=["Events"])
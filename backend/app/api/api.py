from fastapi import APIRouter
from app.api.endpoints import users
from app.api.endpoints import auth
from app.api.endpoints import events
from app.api.endpoints import inscriptions

api_router = APIRouter()
api_router.include_router(users.router, prefix="/v1", tags=["Users"])
api_router.include_router(auth.router, prefix="/v1", tags=["Authentication"])
api_router.include_router(events.router, prefix="/v1", tags=["Events"])
api_router.include_router(inscriptions.router, prefix="/v1", tags=["Inscriptions"])
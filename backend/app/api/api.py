from fastapi import APIRouter
from app.api.endpoints import users
from app.api.endpoints import auth
from app.api.endpoints import events
from app.api.endpoints import inscriptions
from app.api.endpoints import ratings

api_router = APIRouter()

# Rotas de Usuários (dentro do arquivo users.py já tem o prefixo /users)
api_router.include_router(users.router, tags=["Users"])

# Rotas de Autenticação (dentro do arquivo auth.py já tem /token)
api_router.include_router(auth.router, tags=["Authentication"])

# Rotas de Eventos (dentro do arquivo events.py já tem /events)
api_router.include_router(events.router, tags=["Events"])

# Rotas de Inscrições (dentro do arquivo inscriptions.py as rotas são mistas)
api_router.include_router(inscriptions.router, tags=["Inscriptions"])

# Rotas de Avaliações (NOVO - Adicionamos o prefixo /ratings aqui pois no arquivo é /)
api_router.include_router(ratings.router, prefix="/ratings", tags=["Ratings"])
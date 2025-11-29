from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db.base import create_tables
from app.db.models import user
from app.db.models import event
from app.db.models import inscription
from app.api.api import api_router 

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Servidor iniciando...")
    await create_tables()
    print("Tabelas criadas com sucesso (se não existiam).")
    yield
    print("Servidor finalizando...")

app = FastAPI(
    title="Gerenciador de Eventos",
    lifespan=lifespan
)

@app.get("/")
def read_root():
    return {"message": "API de Gerenciamento de Eventos."}

app.include_router(api_router)
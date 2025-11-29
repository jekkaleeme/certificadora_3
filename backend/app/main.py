from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.base import create_tables
# Importe TODOS os modelos aqui para que o create_tables os reconheça
from app.db.models import user
from app.db.models import event
from app.db.models import inscription
from app.db.models import rating  # <--- ADICIONE ESTA LINHA
from app.api.api import api_router 

origins = [
    "http://localhost:5173", # Porta padrão do Vite/React
    "http://localhost:3000", # Outra porta comum
    "http://localhost:8080", # Porta comum do Lovable
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Servidor iniciando...")
    # Cria as tabelas baseadas nos modelos importados acima
    await create_tables()
    print("Tabelas criadas com sucesso (se não existiam).")
    yield
    print("Servidor finalizando...")

app = FastAPI(
    title="Gerenciador de Eventos",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, PUT, DELETE, etc.
    allow_headers=["*"], # Permite todos os cabeçalhos
)

@app.get("/")
def read_root():
    return {"message": "API de Gerenciamento de Eventos."}

app.include_router(api_router)
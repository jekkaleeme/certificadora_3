from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings
from typing import AsyncIterator

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,  
    future=True
)

class Base(DeclarativeBase):
    pass

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db() -> AsyncIterator[AsyncSession]:
    """
    Dependência para obter uma sessão de banco de dados por requisição.
    """
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
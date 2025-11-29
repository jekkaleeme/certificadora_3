from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash
from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    """
    Cria um novo usuário no banco de dados.
    """
    query = select(User).where(User.email == user_in.email)
    result = await db.execute(query)
    db_user = result.scalars().first()
    
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este e-mail já está cadastrado."
        )

    hashed_password = get_password_hash(user_in.password)

    new_user = User(
        email=user_in.email,
        name=user_in.name,
        phone=user_in.phone,
        hashed_password=hashed_password,
        role=user_in.role
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user) 
    
    return new_user

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    """Busca um usuário pelo e-mail."""
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    return result.scalars().first()

async def get_all_users(db: AsyncSession) -> List[User]:
    """Busca todos os usuários do banco."""
    query = select(User)
    result = await db.execute(query)
    return result.scalars().all()

async def update_user(
    db: AsyncSession, user_id: int, user_in: UserUpdate
) -> User:
    """Atualiza dados do usuário."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
        )

    update_data = user_in.model_dump(exclude_unset=True)

    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        user.hashed_password = hashed_password

    for key, value in update_data.items():
        setattr(user, key, value)

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def delete_user(db: AsyncSession, user_id: int):
    """Deleta um usuário (e suas inscrições via cascade)."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
        )
        
    await db.delete(user)
    await db.commit()
    return
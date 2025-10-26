from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserCreate, UserRead
from app.services import user_service
from app.db.base import get_db 
from app.db.models.user import User 
from app.api.deps import get_current_user 
from app.api.deps import get_current_organizer_user
from typing import List

router = APIRouter()

@router.post(
    "/users", 
    response_model=UserRead, 
    status_code=201 
)
async def register_user(
    user_in: UserCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    Cria um novo usuário no sistema.
    """
    try:
        new_user = await user_service.create_user(db=db, user_in=user_in)
        return new_user
    except HTTPException as e:
        raise e
    
@router.get(
    "/users/me", 
    response_model=UserRead
)
async def read_users_me(
    current_user: User = Depends(get_current_user)
):
    """
    Retorna os dados do usuário autenticado.
    """
    return current_user

@router.get(
    "/users/all",
    response_model=List[UserRead],
    dependencies=[Depends(get_current_organizer_user)]
)
async def read_all_users(
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna uma lista de todos os usuários.
    (Acessível apenas para Organizadores e Admins)
    """
    users = await user_service.get_all_users(db)
    return users
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserCreate, UserRead, UserUpdate, UserRole
from app.services import user_service
from app.db.base import get_db 
from app.db.models.user import User 
from app.api.deps import get_current_user, get_current_admin_user 
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

@router.put("/users/me", response_model=UserRead)
async def update_user_me(
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualiza os dados do próprio usuário logado."""
    if user_in.role and current_user.role != UserRole.admin:
         raise HTTPException(status_code=403, detail="Você não pode alterar seu perfil de acesso.")
         
    user = await user_service.update_user(db, current_user.id, user_in)
    return user

@router.put("/users/{user_id}", response_model=UserRead)
async def update_user_by_id(
    user_id: int,
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Admin atualiza dados de outro usuário."""
    user = await user_service.update_user(db, user_id, user_in)
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user) 
):
    """Admin exclui um usuário."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Você não pode se excluir.")
        
    await user_service.delete_user(db, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
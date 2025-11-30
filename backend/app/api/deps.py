from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt
from pydantic import ValidationError
from typing import Optional

from app.core.config import settings
from app.db.base import get_db
from app.db.models.user import User, UserRole
from app.schemas.token import TokenData
from app.services import user_service
from app.db.models.user import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/token", auto_error=False)

async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependência para obter o usuário atual a partir de um token JWT.
    Isso é o nosso "protetor" de rotas.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )

        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception

        token_data = TokenData(email=email, role=payload.get("role"))

    except (JWTError, ValidationError):
        raise credentials_exception

    user = await user_service.get_user_by_email(db, email=token_data.email)

    if user is None:
        raise credentials_exception

    return user

def get_current_organizer_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependência que verifica se o usuário logado é
    um Organizador ou um Admin.
    """
    if current_user.role not in [UserRole.organizer, UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="O usuário não tem privilégios de organizador"
        )
    return current_user

def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependência que verifica se o usuário logado é
    um Admin.
    """
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="O usuário não tem privilégios de administrador"
        )
    return current_user

async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional), 
    db: AsyncSession = Depends(get_db)
) -> User | None:
    """
    Dependência que tenta obter o usuário atual, 
    mas retorna None se o token for inválido ou não fornecido.
    """
    if not token:
        return None

    try:
        user = await get_current_user(token=token, db=db)
        return user
    except HTTPException:
        return None
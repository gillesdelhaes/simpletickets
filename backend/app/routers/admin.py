from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.auth.deps import require_admin
from app.database import get_session
from app.models import AuthProvider, Role, User
from app.schemas.auth import CreateLocalUserRequest
from app.services.passwords import hash_password

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_local_user(
    body: CreateLocalUserRequest,
    _admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Create a local (email + password) account. Admin only."""
    # Validate role value
    try:
        role = Role(body.role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid role '{body.role}'. Valid values: {[r.value for r in Role]}",
        )

    # Check for duplicate email
    result = await session.execute(
        select(User).where(User.email == body.email.lower())
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with that email already exists",
        )

    user = User(
        email=body.email.lower(),
        name=body.name,
        hashed_password=hash_password(body.password),
        role=role,
        auth_provider=AuthProvider.local,
        is_active=True,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "auth_provider": user.auth_provider,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }

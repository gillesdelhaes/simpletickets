"""Public app configuration endpoint — accessible to any authenticated user."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.database import get_session
from app.models.user import User
from app.services.settings_service import get_setting

router = APIRouter(tags=["config"])


class AppConfig(BaseModel):
    timezone: str


@router.get("/app-config", response_model=AppConfig)
async def get_app_config(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> AppConfig:
    tz = await get_setting("timezone", session, default="UTC")
    return AppConfig(timezone=tz)

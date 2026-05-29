"""
Notification Preferences — Chunk 12.

GET  /api/users/me/notification-preferences  — list current prefs (missing rows returned as enabled=True)
PUT  /api/users/me/notification-preferences  — bulk upsert
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.database import get_session
from app.models import NotificationPreference, User
from app.models.enums import NotificationEvent

router = APIRouter(prefix="/users/me/notification-preferences", tags=["notifications"])


class PrefItem(BaseModel):
    event_type: NotificationEvent
    enabled: bool


class PrefsResponse(BaseModel):
    preferences: list[PrefItem]


@router.get("", response_model=PrefsResponse)
async def get_notification_prefs(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PrefsResponse:
    """
    Return notification preferences for the authenticated user.
    Events with no explicit row are returned as enabled=True (opt-out model).
    """
    result = await session.execute(
        select(NotificationPreference).where(
            NotificationPreference.user_id == current_user.id
        )
    )
    existing: dict[NotificationEvent, bool] = {
        p.event_type: p.enabled for p in result.scalars().all()
    }

    prefs = [
        PrefItem(event_type=event, enabled=existing.get(event, True))
        for event in NotificationEvent
    ]
    return PrefsResponse(preferences=prefs)


@router.put("", response_model=PrefsResponse)
async def update_notification_prefs(
    body: PrefsResponse,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PrefsResponse:
    """
    Bulk upsert notification preferences.
    Send the full list; any event not included keeps its current value.
    """
    for item in body.preferences:
        result = await session.execute(
            select(NotificationPreference).where(
                NotificationPreference.user_id == current_user.id,
                NotificationPreference.event_type == item.event_type,
            )
        )
        pref = result.scalar_one_or_none()
        if pref is None:
            pref = NotificationPreference(
                user_id=current_user.id,
                event_type=item.event_type,
                enabled=item.enabled,
            )
            session.add(pref)
        else:
            pref.enabled = item.enabled

    await session.commit()

    # Return the merged state
    result = await session.execute(
        select(NotificationPreference).where(
            NotificationPreference.user_id == current_user.id
        )
    )
    saved: dict[NotificationEvent, bool] = {
        p.event_type: p.enabled for p in result.scalars().all()
    }
    prefs = [
        PrefItem(event_type=event, enabled=saved.get(event, True))
        for event in NotificationEvent
    ]
    return PrefsResponse(preferences=prefs)

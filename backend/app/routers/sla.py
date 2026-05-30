"""
SLA status endpoint — Chunk 11.

GET /api/tickets/{id}/sla  — returns the live SLA state for a ticket,
including remaining seconds, percentage, and a traffic-light label.
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.database import get_session
from app.models import Ticket, User
from app.services.sla import sla_remaining_seconds, sla_status_label

router = APIRouter(tags=["sla"])


class SLAStatus(BaseModel):
    ticket_id: int
    display_id: str
    has_sla: bool
    sla_deadline: Optional[datetime]
    sla_breached: bool
    is_paused: bool
    paused_seconds_total: int
    remaining_seconds: Optional[int]
    remaining_pct: Optional[float]   # 0.0–1.0; None if no SLA
    label: str                        # "ok" | "warning" | "breached" | "none"


@router.get("/tickets/{ticket_id}/sla", response_model=SLAStatus)
async def get_sla_status(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> SLAStatus:
    """Return the live SLA state for a ticket."""
    ticket = await session.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    remaining = sla_remaining_seconds(ticket)
    label = sla_status_label(ticket)

    remaining_pct: Optional[float] = None
    if remaining is not None and ticket.sla_deadline is not None and ticket.created_at is not None:
        deadline = ticket.sla_deadline
        created = ticket.created_at
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        total = (deadline - created).total_seconds()
        if total > 0:
            remaining_pct = max(0.0, min(1.0, remaining / total))

    return SLAStatus(
        ticket_id=ticket.id,
        display_id=ticket.display_id,
        has_sla=ticket.sla_deadline is not None,
        sla_deadline=ticket.sla_deadline,
        sla_breached=ticket.sla_breached,
        is_paused=ticket.sla_paused_at is not None,
        paused_seconds_total=ticket.sla_paused_seconds,
        remaining_seconds=remaining,
        remaining_pct=remaining_pct,
        label=label,
    )

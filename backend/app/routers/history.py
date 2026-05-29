"""
Ticket History — Chunk 13.

GET /api/tickets/{id}/history
  Returns the field-change history for a ticket in chronological order.
  End-users: own tickets only.
  Technicians/admins: any ticket.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.auth.deps import get_current_user
from app.database import get_session
from app.models import Ticket, TicketHistory, User
from app.models.enums import Role
from app.schemas.audit import TicketHistoryRead

router = APIRouter(tags=["history"])


@router.get("/tickets/{ticket_id}/history", response_model=list[TicketHistoryRead])
async def get_ticket_history(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[TicketHistoryRead]:
    """
    Return all field-change history for a ticket, oldest-first.
    End-users can only view history for their own tickets.
    """
    ticket = await session.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if current_user.role == Role.end_user and ticket.submitter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    Actor = aliased(User, flat=True)

    stmt = (
        select(
            TicketHistory,
            Actor.name.label("actor_name"),
        )
        .outerjoin(Actor, TicketHistory.actor_id == Actor.id)
        .where(TicketHistory.ticket_id == ticket_id)
        .order_by(TicketHistory.created_at.asc())
    )

    rows = (await session.execute(stmt)).all()

    return [
        TicketHistoryRead(
            id=row[0].id,
            ticket_id=row[0].ticket_id,
            actor_id=row[0].actor_id,
            actor_name=row[1],
            field_changed=row[0].field_changed,
            old_value=row[0].old_value,
            new_value=row[0].new_value,
            created_at=row[0].created_at,
        )
        for row in rows
    ]

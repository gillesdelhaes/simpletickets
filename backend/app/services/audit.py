"""
Audit log service — append-only writes.
Call write_audit() before committing the parent transaction so the audit
entry and the business change land in the same commit.
"""
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AuditLog


async def write_audit(
    session: AsyncSession,
    *,
    actor_id: Optional[int],
    action: str,
    entity_type: str,
    entity_id: Optional[Any] = None,
    payload: Optional[dict] = None,
    ip_address: Optional[str] = None,
) -> None:
    """
    Queue an audit log entry in the current session.
    The caller is responsible for committing.
    """
    entry = AuditLog(
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        payload=payload,
        ip_address=ip_address,
    )
    session.add(entry)

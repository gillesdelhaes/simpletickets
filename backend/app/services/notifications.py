"""
Email Notification Service — Chunk 12.

Opt-out model: a NotificationPreference row with enabled=False means the user
has opted out. A missing row means opted IN. All functions are fire-and-forget
— they read from the DB, build the email, then hand off to send_email() which
runs in a ThreadPoolExecutor. A notification failure never raises to the caller.

Recipients per event:
  ticket_created   → submitter (confirmation) + all active techs/admins
  reply_added      → public: submitter + assignee (if not author)
                     internal: all active techs/admins except author
  status_changed   → submitter (if not the actor who changed it)
  ticket_resolved  → submitter
  ticket_assigned  → newly assigned technician
  sla_breached     → assignee + all admins
"""
import logging
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import NotificationPreference, User
from app.models.enums import NotificationEvent, Role
from app.services.email import send_email

logger = logging.getLogger(__name__)

# ── helpers ────────────────────────────────────────────────────────────────────


def _ticket_url(ticket_id: int) -> str:
    return f"{settings.app_base_url}/tickets/{ticket_id}"


async def _pref_enabled(session: AsyncSession, user_id: int, event: NotificationEvent) -> bool:
    """Returns True unless the user has an explicit opt-out row."""
    result = await session.execute(
        select(NotificationPreference).where(
            NotificationPreference.user_id == user_id,
            NotificationPreference.event_type == event,
        )
    )
    pref = result.scalar_one_or_none()
    return pref.enabled if pref is not None else True


async def _active_staff(session: AsyncSession) -> list[User]:
    """All active technicians and admins."""
    result = await session.execute(
        select(User).where(
            User.is_active == True,  # noqa: E712
            User.role.in_([Role.technician, Role.admin]),
        )
    )
    return list(result.scalars().all())


async def _active_admins(session: AsyncSession) -> list[User]:
    result = await session.execute(
        select(User).where(
            User.is_active == True,  # noqa: E712
            User.role == Role.admin,
        )
    )
    return list(result.scalars().all())


def _base_html(title: str, body_html: str, ticket_url: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #F9F9F9; margin: 0; padding: 32px 16px; color: #262626; }}
    .card {{ background: #fff; border-radius: 12px; max-width: 560px; margin: 0 auto;
             overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.06); }}
    .header {{ background: linear-gradient(135deg, #FF4713 0%, #AD1164 100%);
               padding: 24px 32px; }}
    .header h1 {{ margin: 0; font-size: 20px; font-weight: 700; color: #fff;
                  letter-spacing: -0.02em; }}
    .header p  {{ margin: 4px 0 0; font-size: 12px; color: rgba(255,255,255,.7); }}
    .body {{ padding: 28px 32px; }}
    .body p {{ margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #262626; }}
    .meta {{ background: #F9F9F9; border-radius: 8px; padding: 14px 16px;
             margin: 16px 0; font-size: 13px; }}
    .meta dt {{ font-weight: 600; color: #0A0A0A; display: inline; }}
    .meta dd {{ display: inline; margin: 0; color: #737373; }}
    .meta div {{ margin-bottom: 6px; }}
    .cta {{ display: inline-block; margin-top: 8px; padding: 12px 24px;
            background: linear-gradient(135deg, #FF4713 0%, #AD1164 100%);
            color: #fff; text-decoration: none; border-radius: 8px;
            font-size: 14px; font-weight: 600; }}
    .footer {{ padding: 16px 32px; font-size: 11px; color: #A3A3A3; border-top: 1px solid #F2F2F2; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Simply<span style="font-weight:200">Tickets</span></h1>
      <p>{title}</p>
    </div>
    <div class="body">
      {body_html}
      <a href="{ticket_url}" class="cta">View ticket →</a>
    </div>
    <div class="footer">
      You are receiving this because you are subscribed to SimplyTickets notifications.
      Manage your preferences in the app.
    </div>
  </div>
</body>
</html>"""


# ── ticket_created ─────────────────────────────────────────────────────────────


async def notify_ticket_created(
    session: AsyncSession,
    ticket_id: int,
    ticket_display_id: str,
    ticket_title: str,
    ticket_priority: str,
    submitter_id: Optional[int],
    submitter_name: str,
    submitter_email: Optional[str],
) -> None:
    try:
        url = _ticket_url(ticket_id)
        subject = f"[{ticket_display_id}] New ticket: {ticket_title}"

        # Confirmation to submitter
        if submitter_email and submitter_id:
            if await _pref_enabled(session, submitter_id, NotificationEvent.ticket_created):
                html = _base_html(
                    "Your ticket has been received",
                    f"""<p>Hi {submitter_name},</p>
                    <p>Your support ticket has been submitted and our team will get back to you shortly.</p>
                    <div class="meta">
                      <div><dt>Ticket: </dt><dd>{ticket_display_id}</dd></div>
                      <div><dt>Title: </dt><dd>{ticket_title}</dd></div>
                      <div><dt>Priority: </dt><dd>{ticket_priority}</dd></div>
                    </div>""",
                    url,
                )
                send_email(
                    to=submitter_email,
                    subject=subject,
                    html_body=html,
                    text_body=f"Ticket {ticket_display_id} received: {ticket_title}\n{url}",
                )

        # Notify all active staff
        staff = await _active_staff(session)
        for user in staff:
            if user.id == submitter_id:
                continue  # submitter already notified above
            if not await _pref_enabled(session, user.id, NotificationEvent.ticket_created):
                continue
            html = _base_html(
                "New ticket submitted",
                f"""<p>A new support ticket has been submitted.</p>
                <div class="meta">
                  <div><dt>Ticket: </dt><dd>{ticket_display_id}</dd></div>
                  <div><dt>Title: </dt><dd>{ticket_title}</dd></div>
                  <div><dt>Priority: </dt><dd>{ticket_priority}</dd></div>
                  <div><dt>Submitted by: </dt><dd>{submitter_name}</dd></div>
                </div>""",
                url,
            )
            send_email(
                to=user.email,
                subject=subject,
                html_body=html,
                text_body=f"New ticket {ticket_display_id}: {ticket_title} (by {submitter_name})\n{url}",
            )
    except Exception as exc:
        logger.error("notify_ticket_created failed: %s", exc)


# ── reply_added ────────────────────────────────────────────────────────────────


async def notify_reply_added(
    session: AsyncSession,
    ticket_id: int,
    ticket_display_id: str,
    ticket_title: str,
    reply_body: str,
    is_internal: bool,
    author_id: Optional[int],
    author_name: str,
    submitter_id: Optional[int],
    assignee_id: Optional[int],
) -> None:
    try:
        url = _ticket_url(ticket_id)
        preview = reply_body[:300] + ("…" if len(reply_body) > 300 else "")

        if is_internal:
            # Internal note — notify staff only
            staff = await _active_staff(session)
            subject = f"[{ticket_display_id}] Internal note added"
            for user in staff:
                if user.id == author_id:
                    continue
                if not await _pref_enabled(session, user.id, NotificationEvent.reply_added):
                    continue
                html = _base_html(
                    "Internal note added",
                    f"""<p><strong>{author_name}</strong> added an internal note:</p>
                    <div class="meta"><p style="margin:0;white-space:pre-wrap">{preview}</p></div>
                    <p style="font-size:12px;color:#737373">This note is only visible to staff.</p>""",
                    url,
                )
                send_email(
                    to=user.email,
                    subject=subject,
                    html_body=html,
                    text_body=f"Internal note on {ticket_display_id}: {preview}\n{url}",
                )
        else:
            # Public reply — notify submitter and assignee
            recipients: dict[int, User] = {}

            if submitter_id and submitter_id != author_id:
                submitter = await session.get(User, submitter_id)
                if submitter and submitter.is_active:
                    recipients[submitter.id] = submitter

            if assignee_id and assignee_id != author_id and assignee_id not in recipients:
                assignee = await session.get(User, assignee_id)
                if assignee and assignee.is_active:
                    recipients[assignee.id] = assignee

            subject = f"[{ticket_display_id}] New reply from {author_name}"
            for user in recipients.values():
                if not await _pref_enabled(session, user.id, NotificationEvent.reply_added):
                    continue
                html = _base_html(
                    f"New reply on {ticket_display_id}",
                    f"""<p><strong>{author_name}</strong> replied to <em>{ticket_title}</em>:</p>
                    <div class="meta"><p style="margin:0;white-space:pre-wrap">{preview}</p></div>""",
                    url,
                )
                send_email(
                    to=user.email,
                    subject=subject,
                    html_body=html,
                    text_body=f"{author_name} replied on {ticket_display_id}: {preview}\n{url}",
                )
    except Exception as exc:
        logger.error("notify_reply_added failed: %s", exc)


# ── status_changed ─────────────────────────────────────────────────────────────


async def notify_status_changed(
    session: AsyncSession,
    ticket_id: int,
    ticket_display_id: str,
    ticket_title: str,
    old_status: str,
    new_status: str,
    submitter_id: Optional[int],
    actor_id: Optional[int],
) -> None:
    try:
        if submitter_id is None or submitter_id == actor_id:
            return  # don't notify the person who made the change

        submitter = await session.get(User, submitter_id)
        if not submitter or not submitter.is_active:
            return

        event = (
            NotificationEvent.ticket_resolved
            if new_status in ("resolved", "closed")
            else NotificationEvent.status_changed
        )
        if not await _pref_enabled(session, submitter_id, event):
            return

        url = _ticket_url(ticket_id)
        subject = f"[{ticket_display_id}] Status changed to {new_status.replace('_', ' ').title()}"
        html = _base_html(
            "Ticket status updated",
            f"""<p>Hi {submitter.name},</p>
            <p>The status of your ticket <strong>{ticket_display_id}</strong> has been updated.</p>
            <div class="meta">
              <div><dt>Title: </dt><dd>{ticket_title}</dd></div>
              <div><dt>Previous status: </dt><dd>{old_status.replace('_', ' ').title()}</dd></div>
              <div><dt>New status: </dt><dd>{new_status.replace('_', ' ').title()}</dd></div>
            </div>""",
            url,
        )
        send_email(
            to=submitter.email,
            subject=subject,
            html_body=html,
            text_body=f"Ticket {ticket_display_id} status changed: {old_status} → {new_status}\n{url}",
        )
    except Exception as exc:
        logger.error("notify_status_changed failed: %s", exc)


# ── ticket_assigned ────────────────────────────────────────────────────────────


async def notify_ticket_assigned(
    session: AsyncSession,
    ticket_id: int,
    ticket_display_id: str,
    ticket_title: str,
    ticket_priority: str,
    assignee_id: int,
    actor_id: Optional[int],
) -> None:
    try:
        if assignee_id == actor_id:
            return  # self-assignment — no notification needed

        assignee = await session.get(User, assignee_id)
        if not assignee or not assignee.is_active:
            return
        if not await _pref_enabled(session, assignee_id, NotificationEvent.ticket_assigned):
            return

        url = _ticket_url(ticket_id)
        subject = f"[{ticket_display_id}] Ticket assigned to you"
        html = _base_html(
            "Ticket assigned to you",
            f"""<p>Hi {assignee.name},</p>
            <p>A support ticket has been assigned to you.</p>
            <div class="meta">
              <div><dt>Ticket: </dt><dd>{ticket_display_id}</dd></div>
              <div><dt>Title: </dt><dd>{ticket_title}</dd></div>
              <div><dt>Priority: </dt><dd>{ticket_priority}</dd></div>
            </div>""",
            url,
        )
        send_email(
            to=assignee.email,
            subject=subject,
            html_body=html,
            text_body=f"Ticket {ticket_display_id} assigned to you: {ticket_title}\n{url}",
        )
    except Exception as exc:
        logger.error("notify_ticket_assigned failed: %s", exc)


# ── sla_breached ───────────────────────────────────────────────────────────────


async def notify_sla_breached(
    session: AsyncSession,
    ticket_id: int,
    ticket_display_id: str,
    ticket_title: str,
    ticket_priority: str,
    assignee_id: Optional[int],
) -> None:
    try:
        url = _ticket_url(ticket_id)
        subject = f"🚨 [{ticket_display_id}] SLA breached — {ticket_title}"

        recipients: dict[int, User] = {}

        if assignee_id:
            assignee = await session.get(User, assignee_id)
            if assignee and assignee.is_active:
                recipients[assignee.id] = assignee

        for admin in await _active_admins(session):
            if admin.id not in recipients:
                recipients[admin.id] = admin

        for user in recipients.values():
            if not await _pref_enabled(session, user.id, NotificationEvent.sla_breached):
                continue
            html = _base_html(
                "SLA Breached",
                f"""<p>Hi {user.name},</p>
                <p>The SLA deadline for the following ticket has been breached and requires
                immediate attention.</p>
                <div class="meta">
                  <div><dt>Ticket: </dt><dd>{ticket_display_id}</dd></div>
                  <div><dt>Title: </dt><dd>{ticket_title}</dd></div>
                  <div><dt>Priority: </dt><dd>{ticket_priority}</dd></div>
                </div>""",
                url,
            )
            send_email(
                to=user.email,
                subject=subject,
                html_body=html,
                text_body=f"SLA BREACHED — {ticket_display_id}: {ticket_title} (priority: {ticket_priority})\n{url}",
            )
    except Exception as exc:
        logger.error("notify_sla_breached failed: %s", exc)

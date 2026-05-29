"""
Minimal email service — fire-and-forget via smtplib in a thread pool.

In development (SMTP_HOST not set), emails are printed to stdout so reset
links and notifications are visible without a real mail server.

Chunk 14 will expand this with full HTML templates for every notification event.
"""
import logging
import smtplib
from concurrent.futures import ThreadPoolExecutor
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)

# Single shared executor — keeps the thread count bounded
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="email-")


def _send_sync(to: str, subject: str, html_body: str, text_body: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from
    msg["To"] = to
    msg.attach(MIMEText(text_body or html_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        if settings.smtp_tls:
            server.starttls()
        if settings.smtp_user:
            server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(settings.smtp_from, [to], msg.as_string())


def send_email(
    to: str,
    subject: str,
    html_body: str,
    text_body: str = "",
) -> None:
    """
    Queue an email for delivery.

    When SMTP is not configured, the email is logged to stdout instead —
    useful in development to retrieve password-reset links without a mail server.
    """
    if not settings.smtp_host:
        logger.info(
            "\n─── DEV EMAIL ───────────────────────────────\n"
            "To:      %s\n"
            "Subject: %s\n\n%s\n"
            "─────────────────────────────────────────────",
            to,
            subject,
            text_body or html_body,
        )
        return

    def _task() -> None:
        try:
            _send_sync(to, subject, html_body, text_body)
            logger.debug("Email sent to %s — %s", to, subject)
        except Exception as exc:
            logger.error("Failed to send email to %s: %s", to, exc)

    _executor.submit(_task)

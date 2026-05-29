"""
Short-lived signed tokens for password reset.
Uses itsdangerous URLSafeTimedSerializer — no DB row required.
"""
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from app.config import settings

_SALT = "simplytickets-pw-reset"
_EXPIRY_SECONDS = 3600  # 1 hour


def _serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(settings.app_secret_key, salt=_SALT)


def create_reset_token(email: str) -> str:
    """Return a signed, time-stamped token encoding the email address."""
    return _serializer().dumps(email)


def verify_reset_token(token: str) -> str | None:
    """
    Verify the token and return the embedded email.
    Returns None when the token is expired or tampered with.
    """
    try:
        return _serializer().loads(token, max_age=_EXPIRY_SECONDS)
    except (SignatureExpired, BadSignature):
        return None

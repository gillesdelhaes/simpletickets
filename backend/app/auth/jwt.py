from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.config import settings_manager

_ALGORITHM = "HS256"
_EXPIRE_HOURS = 8


def create_access_token(user_id: int, email: str, role: str, name: str = "") -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "name": name,
        "iat": now,
        "exp": now + timedelta(hours=_EXPIRE_HOURS),
    }
    return jwt.encode(payload, settings_manager.jwt_secret, algorithm=_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and verify a JWT. Raises jose.JWTError on failure."""
    return jwt.decode(token, settings_manager.jwt_secret, algorithms=[_ALGORITHM])

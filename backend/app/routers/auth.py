from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.auth.deps import get_current_user
from app.auth.google import oauth
from app.auth.jwt import create_access_token
from app.auth.tokens import create_reset_token, verify_reset_token
from app.config import settings
from app.database import get_session
from app.models import AuthProvider, Role, User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.services.email import send_email
from app.services.passwords import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


# ── helpers ───────────────────────────────────────────────────────────────────


def _assert_domain(email: str) -> None:
    """Raise 403 when the email domain does not match GOOGLE_WORKSPACE_DOMAIN."""
    if not settings.google_workspace_domain:
        return
    domain = email.split("@")[-1].lower()
    allowed = settings.google_workspace_domain.lower()
    if domain != allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Only @{allowed} accounts are permitted",
        )


# ── Local account login ───────────────────────────────────────────────────────


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    session: AsyncSession = Depends(get_session),
) -> TokenResponse:
    """Authenticate with email + password. Returns a Bearer JWT."""
    result = await session.execute(
        select(User).where(User.email == body.email.lower())
    )
    user = result.scalar_one_or_none()

    # Single generic message — do not reveal whether the email exists
    _invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if user is None or user.auth_provider != AuthProvider.local:
        raise _invalid
    if not user.hashed_password or not verify_password(body.password, user.hashed_password):
        raise _invalid
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled — contact your administrator",
        )

    user.last_login_at = datetime.now(timezone.utc)
    await session.commit()

    return TokenResponse(
        access_token=create_access_token(user.id, user.email, user.role.value)
    )


# ── Password reset ────────────────────────────────────────────────────────────


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    body: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """
    Send a password-reset email.
    Always returns 200 regardless of whether the email exists —
    this prevents user enumeration.
    """
    result = await session.execute(
        select(User).where(User.email == body.email.lower())
    )
    user = result.scalar_one_or_none()

    if user and user.auth_provider == AuthProvider.local and user.is_active:
        token = create_reset_token(user.email)
        reset_url = f"{settings.app_base_url}/reset-password?token={token}"

        send_email(
            to=user.email,
            subject="Reset your SimplyTickets password",
            html_body=(
                f"<p>Hi {user.name},</p>"
                f"<p>Click the link below to reset your SimplyTickets password. "
                f"This link expires in <strong>1 hour</strong>.</p>"
                f'<p><a href="{reset_url}">{reset_url}</a></p>'
                f"<p>If you did not request a password reset, ignore this email.</p>"
            ),
            text_body=(
                f"Hi {user.name},\n\n"
                f"Reset your SimplyTickets password:\n{reset_url}\n\n"
                f"This link expires in 1 hour.\n"
                f"If you did not request this, ignore the email."
            ),
        )

    return {"message": "If that email has an account, a reset link has been sent"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    body: ResetPasswordRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Verify the reset token and update the user's password."""
    email = verify_reset_token(body.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset link is invalid or has expired",
        )

    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not user.is_active or user.auth_provider != AuthProvider.local:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset link is invalid or has expired",
        )

    user.hashed_password = hash_password(body.new_password)
    await session.commit()

    return {"message": "Password updated — you can now log in"}


# ── Google OIDC ───────────────────────────────────────────────────────────────


@router.get("/google/login", include_in_schema=True)
async def google_login(request: Request) -> RedirectResponse:
    """Redirect the browser to Google's OAuth consent screen."""
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google SSO is not configured on this server",
        )
    redirect_uri = str(request.url_for("google_callback"))
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", name="google_callback", include_in_schema=False)
async def google_callback(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> RedirectResponse:
    """
    Handle the OAuth callback from Google.
    Creates or updates the User row, issues a JWT, redirects to the
    frontend /auth/callback page with ?token=.
    """
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception:
        return RedirectResponse(url=f"{settings.app_base_url}/login?error=oauth_failed")

    userinfo = token.get("userinfo") or {}
    email: str = (userinfo.get("email") or "").strip().lower()

    if not email:
        return RedirectResponse(url=f"{settings.app_base_url}/login?error=no_email")

    try:
        _assert_domain(email)
    except HTTPException:
        return RedirectResponse(url=f"{settings.app_base_url}/login?error=domain_not_allowed")

    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    now = datetime.now(timezone.utc)

    if user is None:
        user = User(
            email=email,
            name=userinfo.get("name") or email.split("@")[0],
            avatar_url=userinfo.get("picture"),
            role=Role.end_user,
            auth_provider=AuthProvider.google,
            google_sub=userinfo.get("sub"),
            is_active=True,
            created_at=now,
        )
        session.add(user)
    else:
        if not user.is_active:
            return RedirectResponse(url=f"{settings.app_base_url}/login?error=account_disabled")
        user.name = userinfo.get("name") or user.name
        user.avatar_url = userinfo.get("picture") or user.avatar_url
        user.google_sub = userinfo.get("sub") or user.google_sub

    user.last_login_at = now
    await session.commit()
    await session.refresh(user)

    jwt = create_access_token(user.id, user.email, user.role.value)
    return RedirectResponse(url=f"{settings.app_base_url}/auth/callback?token={jwt}")


# ── Session endpoints ─────────────────────────────────────────────────────────


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)) -> dict:
    """Return the profile of the currently authenticated user."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "avatar_url": current_user.avatar_url,
        "role": current_user.role,
        "auth_provider": current_user.auth_provider,
        "created_at": current_user.created_at,
        "last_login_at": current_user.last_login_at,
    }


@router.post("/logout")
async def logout() -> dict:
    """
    JWT is stateless — token removal is handled client-side.
    This endpoint exists for a clean, symmetrical API.
    """
    return {"message": "Logged out"}

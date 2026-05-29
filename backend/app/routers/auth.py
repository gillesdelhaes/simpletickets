from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.auth.deps import get_current_user
from app.auth.google import oauth
from app.auth.jwt import create_access_token
from app.config import settings
from app.database import get_session
from app.models import AuthProvider, Role, User

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
    - Validates domain restriction
    - Creates or updates the User row
    - Issues a JWT
    - Redirects to the frontend /auth/callback page with ?token=
    """
    # Exchange code → tokens
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception:
        return RedirectResponse(
            url=f"{settings.app_base_url}/login?error=oauth_failed"
        )

    userinfo = token.get("userinfo") or {}
    email: str = (userinfo.get("email") or "").strip().lower()

    if not email:
        return RedirectResponse(
            url=f"{settings.app_base_url}/login?error=no_email"
        )

    try:
        _assert_domain(email)
    except HTTPException:
        return RedirectResponse(
            url=f"{settings.app_base_url}/login?error=domain_not_allowed"
        )

    # Upsert user ──────────────────────────────────────────────────────────────
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
            return RedirectResponse(
                url=f"{settings.app_base_url}/login?error=account_disabled"
            )
        # Refresh profile on every login
        user.name = userinfo.get("name") or user.name
        user.avatar_url = userinfo.get("picture") or user.avatar_url
        user.google_sub = userinfo.get("sub") or user.google_sub

    user.last_login_at = now
    await session.commit()
    await session.refresh(user)

    jwt = create_access_token(user.id, user.email, user.role.value)
    return RedirectResponse(
        url=f"{settings.app_base_url}/auth/callback?token={jwt}"
    )


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
    JWT is stateless — the actual token deletion happens on the client.
    This endpoint exists so the frontend has a consistent API call to make.
    """
    return {"message": "Logged out"}

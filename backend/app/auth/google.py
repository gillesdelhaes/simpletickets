from authlib.integrations.starlette_client import OAuth

from app.config import settings

oauth = OAuth()
_registered = False


def init_oauth() -> None:
    """
    Register the Google OIDC provider. Safe to call multiple times.
    Skips registration when GOOGLE_CLIENT_ID is not configured so the
    app still starts in local dev without SSO credentials.
    """
    global _registered
    if _registered or not settings.google_client_id:
        return

    oauth.register(
        name="google",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        server_metadata_url=(
            "https://accounts.google.com/.well-known/openid-configuration"
        ),
        client_kwargs={
            "scope": "openid email profile",
            "prompt": "select_account",
        },
    )
    _registered = True

from google.auth.transport import requests
from google.oauth2 import id_token

from app.core.config import settings


class GoogleAuthError(Exception):
    pass


def verify_google_id_token(id_token_str: str) -> dict:
    """Verify a Google ID token and return its claims.

    Raises GoogleAuthError if verification fails or the audience mismatch.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise GoogleAuthError("Google OAuth is not configured on the server")
    try:
        info = id_token.verify_oauth2_token(
            id_token_str, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except Exception as exc:  # network / signature / audience errors
        raise GoogleAuthError(f"Google token verification failed: {exc}") from exc
    if info.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise GoogleAuthError("Invalid token issuer")
    return info

# SERVER/services/auth_utils.py
"""
Firebase-based authentication utilities.
Replaces previous JWT/password/SQL logic.

Usage:
- Initialize Firebase Admin by setting FIREBASE_SERVICE_ACCOUNT env var
  pointing to the service account JSON file.
- Frontend should sign in/register using Firebase client SDK and send ID token
  to backend in Authorization: Bearer <idToken> header.
- Use `Depends(get_current_user)` in FastAPI route to protect endpoints.
"""

import os
from typing import Dict, Optional
from fastapi import Depends, HTTPException, Request, status
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

# Initialize Firebase Admin if not already initialized
def _init_firebase_admin():
    if firebase_admin._apps:
        return
    sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if not sa_path:
        # Fail early so developer notices missing config
        raise RuntimeError("FIREBASE_SERVICE_ACCOUNT env var not set. Provide path to service account JSON.")
    cred = credentials.Certificate(sa_path)
    firebase_admin.initialize_app(cred)

# initialize on import (main.py also does init on startup; double init is safe-guarded)
try:
    _init_firebase_admin()
except Exception as e:
    # If init fails at import time (e.g., during certain tests), raise a clear error.
    # You can choose to log instead, but raising helps catch config issues early.
    raise

# -----------------------------
# Server-side user creation (optional)
# -----------------------------
def create_user_server(email: str, password: str, display_name: Optional[str] = None) -> Dict:
    """
    Create a Firebase Auth user via Admin SDK.
    Returns dict { uid, email, display_name }.
    Note: prefer client-side signup using Firebase SDK; use this only if needed.
    """
    try:
        user_record = firebase_auth.create_user(email=email, password=password, display_name=display_name)
        return {"uid": user_record.uid, "email": user_record.email, "display_name": user_record.display_name}
    except Exception as e:
        # bubble up exception to be handled by route
        raise

# -----------------------------
# ID token verification
# -----------------------------
def verify_firebase_id_token(id_token: str) -> Dict:
    """
    Verify a Firebase ID token and return decoded claims (uid, email, name, etc).
    Raises HTTPException(401) on invalid/expired token.
    """
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        return decoded
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid or expired Firebase ID token: {e}")

# -----------------------------
# FastAPI dependency
# -----------------------------
async def get_current_user(request: Request):
    """
    FastAPI dependency that reads Authorization header for Bearer <idToken>,
    verifies it, and returns decoded token.
    Example usage in a route:
        @router.get("/protected")
        def protected(decoded_token = Depends(get_current_user)):
            uid = decoded_token["uid"]
            ...
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    parts = auth_header.split()
    if parts[0].lower() != "bearer" or len(parts) != 2:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header format")
    id_token = parts[1]
    decoded = verify_firebase_id_token(id_token)
    return decoded

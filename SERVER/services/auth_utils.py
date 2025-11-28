# SERVER/services/auth_utils.py

import os
import json
import base64
from typing import Dict, Optional
from fastapi import Depends, HTTPException, Request, status
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from dotenv import load_dotenv

load_dotenv()  # local .env for dev only

def _load_service_account_from_env_or_path() -> dict:
    """
    Return a service account dict in one of these ways (in priority order):
    1) If FIREBASE_SERVICE_ACCOUNT env looks like a path and file exists -> load JSON from file (local dev)
    2) Else try to base64-decode the env value and parse JSON (recommended for Vercel)
    3) Else try to parse the env value directly as JSON (if you pasted raw JSON)
    Raises RuntimeError if nothing valid found.
    """
    raw = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if not raw:
        raise RuntimeError("FIREBASE_SERVICE_ACCOUNT env var not set.")

    # 1) treat as path (relative to repo root). This supports your local .env value like: secrets/serviceAccountKey.json
    if os.path.exists(raw):
        with open(raw, "r", encoding="utf-8") as fh:
            return json.load(fh)

    # 2) try base64 decode
    try:
        decoded = base64.b64decode(raw).decode("utf-8")
        parsed = json.loads(decoded)
        return parsed
    except Exception:
        pass

    # 3) try raw JSON string
    try:
        parsed = json.loads(raw)
        return parsed
    except Exception:
        pass

    raise RuntimeError("FIREBASE_SERVICE_ACCOUNT must be a valid path, base64-encoded JSON, or raw JSON string.")

def _init_firebase_admin():
    """
    Initialize firebase_admin with the loaded credentials.
    Safe to call multiple times; will skip if already initialized.
    """
    if firebase_admin._apps:
        return

    sa_info = _load_service_account_from_env_or_path()
    cred = credentials.Certificate(sa_info)
    firebase_admin.initialize_app(cred)

# initialize firebase on import (so other modules can rely on it)
try:
    _init_firebase_admin()
except Exception as e:
    # during import in some environments you may want to avoid hard failure;
    # raising here will cause the app to error at import time.
    # For now, surface a clear message so you can debug quickly.
    raise RuntimeError(f"Failed to initialize Firebase Admin: {e}")

# -----------------------------
# Create user (server-side)
# -----------------------------
def create_user_server(email: str, password: str, display_name: Optional[str] = None) -> Dict:
    try:
        user_record = firebase_auth.create_user(
            email=email,
            password=password,
            display_name=display_name
        )
        return {
            "uid": user_record.uid,
            "email": user_record.email,
            "display_name": user_record.display_name
        }
    except Exception:
        raise

# -----------------------------
# Verify Firebase ID token
# -----------------------------
def verify_firebase_id_token(id_token: str) -> Dict:
    try:
        return firebase_auth.verify_id_token(id_token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase ID token: {e}"
        )

# -----------------------------
# FastAPI dependency
# -----------------------------
async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    parts = auth_header.split()
    if parts[0].lower() != "bearer" or len(parts) != 2:
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")

    id_token = parts[1]
    return verify_firebase_id_token(id_token)

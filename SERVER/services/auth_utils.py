# SERVER/services/auth_utils.py

import os
import json
from typing import Dict, Optional
from fastapi import Depends, HTTPException, Request, status
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from dotenv import load_dotenv

load_dotenv()  # load .env

def _init_firebase_admin():
    if firebase_admin._apps:
        return

    sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if not sa_path:
        raise RuntimeError("FIREBASE_SERVICE_ACCOUNT env var not set.")

    # Convert relative path (e.g., secrets/serviceAccountKey.json) to absolute path
    services_dir = os.path.dirname(__file__)              # SERVER/services
    server_root = os.path.dirname(services_dir)           # SERVER
    full_path = os.path.join(server_root, sa_path)        # SERVER/secrets/serviceAccountKey.json

    if not os.path.exists(full_path):
        raise RuntimeError(f"Service account JSON not found at: {full_path}")

    cred = credentials.Certificate(full_path)
    firebase_admin.initialize_app(cred)

# initialize firebase
_init_firebase_admin()

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

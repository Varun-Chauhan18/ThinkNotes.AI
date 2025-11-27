# SERVER/routes/auth.py
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

from services import auth_utils

router = APIRouter(prefix="/auth", tags=["auth"])

# ---- Request / Response models ----
class SignupIn(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class LoginIn(BaseModel):
    id_token: Optional[str] = None

class LoginOut(BaseModel):
    uid: str
    email: EmailStr
    claims: Dict[str, Any]

# ---- Endpoints ----

@router.post("/register", status_code=201)
def register(payload: SignupIn):
    """
    Optional server-side signup (creates Firebase Auth user).
    Prefer client-side signup using Firebase client SDK, but this endpoint
    exists if you want backend-created accounts.
    """
    try:
        created = auth_utils.create_user_server(email=payload.email, password=payload.password, display_name=payload.full_name)
        return {"uid": created["uid"], "email": created["email"]}
    except Exception as e:
        # Firebase Admin create_user raises on weak password / duplicate email / invalid email
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=LoginOut)
def login(payload: LoginIn):
    """
    Verify Firebase ID token sent from client.
    Clients should sign in using Firebase client SDK (web/mobile) and then send
    the ID token to this endpoint in the request body or via Authorization header.
    """
    if not payload.id_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="id_token is required. Use Firebase client SDK to sign in and obtain idToken.")

    decoded = auth_utils.verify_firebase_id_token(payload.id_token)
    uid = decoded.get("uid")
    email = decoded.get("email")
    return {"uid": uid, "email": email, "claims": decoded}

@router.get("/me")
def me(decoded_token = Depends(auth_utils.get_current_user)):
    """
    Protected endpoint example. The frontend can call this with:
      Authorization: Bearer <idToken>
    to validate token server-side and get user info.
    """
    # decoded_token is the dict returned by Firebase Admin verify_id_token
    return {"uid": decoded_token.get("uid"), "email": decoded_token.get("email"), "claims": decoded_token}

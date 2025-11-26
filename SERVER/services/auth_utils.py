# SERVER/services/auth_utils.py
import os
import hashlib
from datetime import datetime, timedelta
from typing import Generator, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from services import models, db

# Environment values (set in .env)
SECRET_KEY = os.getenv("SECRET_KEY", "change_this_secret_in_production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Use bcrypt via passlib but pre-hash inputs to avoid bcrypt 72-byte limit
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")  # used by FastAPI docs / dependency

# ---------- Utilities for password handling ----------
def _sha256_prehash(password: str) -> str:
    """
    Deterministic pre-hash to avoid bcrypt's 72-byte input limit.
    Returns a hex digest string (64 chars) suitable as bcrypt input.
    """
    if not isinstance(password, str):
        password = str(password)
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def get_password_hash(password: str) -> str:
    """
    Hash a password for storage.
    Pre-hashes with SHA-256, then passes to bcrypt (via passlib).
    """
    pre = _sha256_prehash(password)
    return pwd_context.hash(pre)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against the stored (bcrypt) hash.
    Uses the same SHA-256 pre-hash before verification.
    """
    pre = _sha256_prehash(plain_password)
    return pwd_context.verify(pre, hashed_password)

# ---------- JWT helpers ----------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ---------- DB dependency ----------
def get_db() -> Generator[Session, None, None]:
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

# ---------- User helpers ----------
def get_user_by_email(db_session: Session, email: str):
    return db_session.query(models.User).filter(models.User.email == email).first()

def get_user(db_session: Session, user_id: int):
    return db_session.query(models.User).filter(models.User.id == user_id).first()

def authenticate_user(db_session: Session, email: str, password: str):
    user = get_user_by_email(db_session, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

# ---------- Dependency to retrieve current user from token ----------
async def get_current_user(token: str = Depends(oauth2_scheme), db_session: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        # sub may be stored as string — convert to int when possible
        try:
            user_id = int(sub)
        except (TypeError, ValueError):
            # if sub is not numeric, treat as invalid
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user(db_session, user_id)
    if user is None:
        raise credentials_exception
    return user

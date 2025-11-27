# SERVER/services/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

# Used only if you want backend-controlled signup (optional)
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

# Used for returning verified Firebase user info
class UserOut(BaseModel):
    uid: str
    email: EmailStr
    full_name: Optional[str] = None

class FirebaseUser(BaseModel):
    uid: str
    email: Optional[EmailStr] = None
    claims: Dict[str, Any]

# SERVER/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from services import schemas, models, auth_utils, db as db_module

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(auth_utils.get_db)):
    # check existing
    existing = auth_utils.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = auth_utils.get_password_hash(user_in.password)
    user = models.User(email=user_in.email, hashed_password=hashed, full_name=user_in.full_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=schemas.Token)
def login(form_data: schemas.UserCreate, db: Session = Depends(auth_utils.get_db)):
    """
    Accepts JSON body: { "email": "...", "password": "..." }
    Returns: { access_token, token_type: "bearer" }
    """
    user = auth_utils.authenticate_user(db, form_data.email, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = auth_utils.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

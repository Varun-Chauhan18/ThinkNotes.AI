# SERVER/main.py
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Routers
from routes import auth as auth_routes
from routes import upload as upload_routes

# Firebase admin (safe init)
import firebase_admin
from firebase_admin import credentials
import json
import base64

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("thinknotes")

app = FastAPI(title="ThinkNotes AI - Gemini PDF/DOCX Processor (Firebase Auth)")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000", 

    "https://think-notes-ai.vercel.app/",
    "https://think-notes-ai.vercel.app",
]

logger.info("Configured CORS origins: %s", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # important: allows Authorization & Content-Type (multipart/form-data)
)

def _init_firebase_admin_from_env_or_path():
    """
    Initialize firebase admin using FIREBASE_SERVICE_ACCOUNT which can be:
    - a path to a JSON file (local dev)
    - a base64-encoded JSON string (production on Vercel)
    - a raw JSON string
    """
    if firebase_admin._apps:
        logger.info("Firebase Admin already initialized.")
        return

    raw = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if not raw:
        logger.warning("FIREBASE_SERVICE_ACCOUNT not set. Firebase Admin will not be initialized on startup.")
        return

    # 1) if raw is a file path and exists, use it
    if os.path.exists(raw):
        try:
            cred = credentials.Certificate(raw)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin initialized from file path.")
            return
        except Exception as e:
            logger.exception("Failed to initialize Firebase Admin from path: %s", e)
            return

    # 2) try base64 decode -> JSON
    try:
        decoded = base64.b64decode(raw).decode("utf-8")
        info = json.loads(decoded)
        cred = credentials.Certificate(info)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin initialized from base64 env.")
        return
    except Exception:
        pass

    # 3) try raw JSON
    try:
        info = json.loads(raw)
        cred = credentials.Certificate(info)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin initialized from raw JSON env.")
        return
    except Exception as e:
        logger.exception("Failed to initialize Firebase Admin from FIREBASE_SERVICE_ACCOUNT: %s", e)

# Initialize Firebase Admin SDK on startup (safe: will skip if already initialized)
@app.on_event("startup")
def on_startup():
    try:
        _init_firebase_admin_from_env_or_path()
    except Exception as e:
        # Log exception; if Firebase is required for your app to function you may want to raise instead.
        logger.exception("Failed to initialize Firebase Admin on startup: %s", e)

# Include routers (auth + upload)
app.include_router(auth_routes.router)
app.include_router(upload_routes.router)

@app.get("/")
def root():
    return {"message": "Gemini PDF/DOCX Processor is running (Firebase Auth enabled)"}

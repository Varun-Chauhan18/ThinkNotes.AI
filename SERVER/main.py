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

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("thinknotes")

app = FastAPI(title="ThinkNotes AI - Gemini PDF/DOCX Processor (Firebase Auth)")

# Frontend origins (adjust if your frontend runs on a different host/port)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase Admin SDK on startup (safe: will skip if already initialized)
@app.on_event("startup")
def on_startup():
    try:
        sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT")
        if not sa_path:
            logger.warning("FIREBASE_SERVICE_ACCOUNT not set. Firebase Admin may have been initialized elsewhere or will fail when auth utilities run.")
            return

        if not firebase_admin._apps:
            cred = credentials.Certificate(sa_path)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin initialized on startup.")
        else:
            logger.info("Firebase Admin already initialized.")
    except Exception as e:
        # Log exception; if Firebase is required for your app to function you may want to raise instead.
        logger.exception("Failed to initialize Firebase Admin on startup: %s", e)

# Include routers (auth + upload)
app.include_router(auth_routes.router)
app.include_router(upload_routes.router)

@app.get("/")
def root():
    return {"message": "Gemini PDF/DOCX Processor is running (Firebase Auth enabled)"}

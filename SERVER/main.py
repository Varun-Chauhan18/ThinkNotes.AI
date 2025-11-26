# SERVER/main.py
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import routers and DB init
from routes import auth as auth_routes
from routes import upload as upload_routes
from services.db import init_db

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("thinknotes")

app = FastAPI(title="ThinkNotes AI - Gemini PDF/DOCX Processor")

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

# Initialize DB tables at startup
@app.on_event("startup")
def on_startup():
    try:
        init_db()
        logger.info("Database initialized (tables created if missing).")
    except Exception:
        logger.exception("Failed to initialize the database on startup.")

# Include routers
# auth router defines endpoints like /auth/register and /auth/login
app.include_router(auth_routes.router)
# upload router already defines prefix="/api/gemini" inside routes/upload.py
app.include_router(upload_routes.router)

@app.get("/")
def root():
    return {"message": "Gemini PDF/DOCX Processor is running"}

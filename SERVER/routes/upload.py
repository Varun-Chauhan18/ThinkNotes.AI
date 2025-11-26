from typing import Any
import base64
import logging

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse

from services.file_parser import extract_text
from services.gemini_service import generate_summary_and_flashcards
from services.pdf_builder import build_ai_pdf
from services.auth_utils import get_current_user

router = APIRouter(prefix="/api/gemini", tags=["gemini"])

logger = logging.getLogger(__name__)


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    return_pdf: bool = True,
    current_user: Any = Depends(get_current_user),
):
    """
    Upload study file (PDF/DOCX), send to Gemini, return AI output.
    Only authenticated users (via Bearer JWT) can call this endpoint.

    If return_pdf=True (default) we include base64-encoded PDF in the JSON.
    """

    # Basic auth info for debug (do not expose in prod logs)
    try:
        logger.debug("Upload requested by user id=%s", getattr(current_user, "id", None))
    except Exception:
        logger.debug("Upload requested by unknown user")

    # Validate file size (max 10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB).")
    await file.seek(0)  # Reset pointer for downstream readers

    # Parse file to text
    try:
        # keep using your existing extractor which accepts UploadFile
        text = await extract_text(file)
        if not text or not text.strip():
            raise ValueError("No extractable text found in file.")
    except ValueError as e:
        # user-level parsing errors (bad file, unreadable)
        logger.warning("File parsing error: %s", e)
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.exception("Unexpected error while parsing uploaded file")
        raise HTTPException(status_code=500, detail=f"Error parsing file: {e}") from e

    # Call Gemini service (protected with try/except to avoid uncaught 500s)
    try:
        summary, flashcards = generate_summary_and_flashcards(text)
    except Exception as e:
        # log full exception server-side, return a friendly error to client
        logger.exception("Gemini service failed while generating content")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {e}") from e

    data = {
        "summary": summary,
        "flashcards": flashcards,
    }

    if return_pdf:
        try:
            pdf_bytes = build_ai_pdf(summary, flashcards)
            data["pdf_b64"] = base64.b64encode(pdf_bytes).decode("utf-8")
        except Exception as e:
            logger.exception("Failed to build PDF from AI results")
            # PDF generation failure shouldn't block returning summary/flashcards
            data["pdf_b64"] = None
            data["pdf_error"] = f"Failed to build PDF: {e}"

    return JSONResponse(content=data)

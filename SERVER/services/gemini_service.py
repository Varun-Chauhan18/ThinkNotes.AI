import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import logging

load_dotenv()

# Load API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set. Add it to SERVER/.env or your shell env.")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# FIXED: Use a supported model (1.5 models are retired and cause 404)
_MODEL_NAME = "gemini-2.5-flash"   # 👈 MAIN FIX


def generate_summary_and_flashcards(text: str):
    """
    Sends text to Gemini and requests a structured JSON response:
    {
      "summary": "string",
      "flashcards": [{ "question": "...", "answer": "..." }]
    }
    """

    model = genai.GenerativeModel(_MODEL_NAME)

    prompt = f"""
You are an AI study assistant. Read the provided study text and produce:

1. A *clear, concise* summary organized by topic headings. Use bullet points where helpful.
2. Exactly 10 flashcards in Question/Answer form.

Respond *only* in valid minified JSON in the following schema:
{{
  "summary": "string (markdown allowed)",
  "flashcards": [
    {{"question": "string", "answer": "string"}},
    {{"question": "string", "answer": "string"}},
    {{"question": "string", "answer": "string"}},
    {{"question": "string", "answer": "string"}},
    {{"question": "string", "answer": "string"}},
    {{"question": "string", "answer": "string"}},
    {{"question": "string", "answer": "string"}},
    {{"question": "string", "answer": "string"}},
    {{"question": "string", "answer": "string"}},
    {{"question": "string", "answer": "string"}}
  ]
}}

Here is the study text:
{text}
"""

    # ---- SAFE CALL WITH ERROR HANDLING ----
    try:
        response = model.generate_content(prompt)
        raw = response.text
    except Exception as e:
        logging.exception("Gemini generate_content failed!")

        # Helpful debug: list models your API key actually supports
        try:
            models = genai.list_models()
            logging.error("Available models: %s", [m.name for m in models])
        except Exception:
            logging.error("Failed to list models")

        raise RuntimeError(f"Gemini API Error: {str(e)}")

    # Remove code fences if Gemini wraps JSON inside ```json```
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].lstrip()

    # Try parsing the JSON response
    try:
        data = json.loads(cleaned)
    except Exception:
        # Fallback: return raw text if JSON fails
        data = {
            "summary": raw,
            "flashcards": [],
        }

    summary = data.get("summary", "").strip()
    flashcards = data.get("flashcards", [])

    # Normalize flashcards format
    norm_cards = []
    for fc in flashcards:
        if isinstance(fc, dict):
            q = fc.get("question", "").strip()
            a = fc.get("answer", "").strip()
            if q or a:
                norm_cards.append({"question": q, "answer": a})

        elif isinstance(fc, (list, tuple)) and len(fc) >= 2:
            norm_cards.append({"question": str(fc[0]), "answer": str(fc[1])})

        elif isinstance(fc, str):
            parts = fc.split(":", 1)
            if len(parts) == 2:
                norm_cards.append({"question": parts[0].strip(), "answer": parts[1].strip()})

    if not norm_cards and flashcards:
        norm_cards = flashcards

    return summary, norm_cards

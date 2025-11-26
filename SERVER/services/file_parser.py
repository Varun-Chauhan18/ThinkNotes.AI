import os
import tempfile
from fastapi import UploadFile
import fitz  # PyMuPDF
import docx

SUPPORTED_EXTS = {".pdf", ".docx"}   # We'll reject .doc for now (legacy binary)


async def extract_text(file: UploadFile) -> str:
    """
    Save uploaded file to temp, detect format by extension,
    parse to plain text.
    """
    suffix = os.path.splitext(file.filename or "")[1].lower()

    temp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    contents = await file.read()
    temp.write(contents)
    temp.close()

    if suffix == ".pdf":
        return _extract_text_from_pdf(temp.name)
    elif suffix == ".docx":
        return _extract_text_from_docx(temp.name)
    else:
        raise ValueError(f"Unsupported file format: {suffix}")


def _extract_text_from_pdf(path: str) -> str:
    text_parts = []
    with fitz.open(path) as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n".join(text_parts)


def _extract_text_from_docx(path: str) -> str:
    d = docx.Document(path)
    return "\n".join([p.text for p in d.paragraphs if p.text.strip()])

# SERVER/services/pdf_builder.py
from io import BytesIO
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from xml.sax.saxutils import escape

# Regex for bold **text**
_BOLD_RE = re.compile(r"\*\*(.+?)\*\*", flags=re.DOTALL)


def _escape_preserve_bold(text: str) -> str:
    """
    Escape text for XML/HTML but preserve bold tokens by turning **text** -> <b>text</b>.
    Steps:
      1. Replace **...** with a placeholder token.
      2. Escape the full string.
      3. Restore placeholder replacing with <b>escaped_inner</b>.
    This prevents <, & etc breaking Paragraph HTML while allowing bold tags.
    """
    placeholders = []

    def _store(match):
        inner = match.group(1)
        placeholders.append(inner)
        return f"__BOLD_PLACEHOLDER_{len(placeholders)-1}__"

    temp = _BOLD_RE.sub(_store, text)
    escaped = escape(temp)
    for idx, inner in enumerate(placeholders):
        escaped_inner = escape(inner)
        escaped = escaped.replace(f"__BOLD_PLACEHOLDER_{idx}__", f"<b>{escaped_inner}</b>")
    return escaped


def _split_lines(text: str):
    # Normalize newlines then split
    if text is None:
        return []
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    return text.split("\n")


def build_ai_pdf(summary: str, flashcards: list) -> bytes:
    """
    Build a PDF bytes object from summary (markdown-ish) and flashcards list.
    Returns bytes of the generated PDF.
    """
    buffer = BytesIO()

    # Setup document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()
    # Define or tweak styles
    heading_style = ParagraphStyle(
        "HeadingMD",
        parent=styles["Heading2"],
        fontSize=14,
        spaceAfter=6,
        leading=16,
        leftIndent=0,
    )

    body_style = ParagraphStyle(
        "BodyMD",
        parent=styles["BodyText"],
        fontSize=10.5,
        leading=14,
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        "BulletMD",
        parent=styles["BodyText"],
        fontSize=10.5,
        leading=14,
        leftIndent=14,
        firstLineIndent=-8,
        spaceAfter=2,
    )

    small_gap = Spacer(1, 6)
    big_gap = Spacer(1, 12)

    flowables = []

    # Title
    title = "<b>ThinkNotes.AI - AI Summary</b>"
    flowables.append(Paragraph(title, styles["Title"]))
    flowables.append(big_gap)

    # Summary section
    if summary:
        flowables.append(Paragraph("<b>Summary:</b>", heading_style))
        flowables.append(small_gap)

        lines = _split_lines(summary)
        i = 0
        while i < len(lines):
            line = lines[i].rstrip()
            if not line:
                # blank line => small gap
                flowables.append(small_gap)
                i += 1
                continue

            # Heading marker (###)
            if line.lstrip().startswith("###"):
                text = line.lstrip().lstrip("#").strip()
                html = _escape_preserve_bold(text)
                flowables.append(Paragraph(html, heading_style))
                i += 1
                continue

            # Bullet item - starts with "* " or "- " or "+ "
            if re.match(r"^\s*[\*\-\+]\s+", line):
                # Collect contiguous bullet lines
                while i < len(lines) and re.match(r"^\s*[\*\-\+]\s+", lines[i]):
                    raw = re.sub(r"^\s*[\*\-\+]\s+", "", lines[i]).strip()
                    html = _escape_preserve_bold(raw)
                    p = Paragraph(html, bullet_style, bulletText="•")
                    flowables.append(p)
                    i += 1
                flowables.append(small_gap)
                continue

            # Normal paragraph: accumulate until blank or special marker
            para_lines = [line]
            i += 1
            while (
                i < len(lines)
                and lines[i].strip()
                and not lines[i].lstrip().startswith("###")
                and not re.match(r"^\s*[\*\-\+]\s+", lines[i])
            ):
                para_lines.append(lines[i].rstrip())
                i += 1
            para_text = " ".join(l.strip() for l in para_lines).strip()
            if para_text:
                html = _escape_preserve_bold(para_text).replace("\n", "<br/>")
                flowables.append(Paragraph(html, body_style))
            flowables.append(small_gap)

    # Flashcards section
    if flashcards:
        flowables.append(big_gap)
        flowables.append(Paragraph("<b>Flashcards:</b>", heading_style))
        flowables.append(small_gap)

        for idx, fc in enumerate(flashcards, start=1):
            if isinstance(fc, dict):
                q = fc.get("question", "")
                a = fc.get("answer", "")
            elif isinstance(fc, (list, tuple)) and len(fc) >= 2:
                q, a = fc[0], fc[1]
            else:
                # fallback: try to split "Q: A" style string
                q = ""
                a = ""
                if isinstance(fc, str):
                    parts = fc.split(":", 1)
                    if len(parts) == 2:
                        q = parts[0].strip()
                        a = parts[1].strip()

            q = (q or "").strip()
            a = (a or "").strip()

            if q:
                q_html = _escape_preserve_bold(f"Q{idx}: {q}")
                flowables.append(Paragraph(q_html, body_style))
            if a:
                a_html = _escape_preserve_bold(f"A{idx}: {a}")
                flowables.append(Paragraph(a_html, bullet_style))
            flowables.append(small_gap)

    # Build PDF
    doc.build(flowables)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


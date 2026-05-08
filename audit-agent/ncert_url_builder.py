"""Build NCERT URLs from question provenance metadata."""
import re
from typing import Optional


TEXTBOOK_URL_PATTERNS = {
    "Mathematics": {
        "6": "https://ncert.nic.in/textbook/pdf/gemh1/{chapter:02d}.pdf",
        "7": "https://ncert.nic.in/textbook/pdf/gemh2/{chapter:02d}.pdf",
        "8": "https://ncert.nic.in/textbook/pdf/gemh3/{chapter:02d}.pdf",
        "9": "https://ncert.nic.in/textbook/pdf/gemh1/{chapter:02d}.pdf",
        "10": "https://ncert.nic.in/textbook/pdf/gemh2/{chapter:02d}.pdf",
        "11": "https://ncert.nic.in/textbook/pdf/gemh1/{chapter:02d}.pdf",
        "12": "https://ncert.nic.in/textbook/pdf/gemh1/{chapter:02d}.pdf",
    },
    "Science": {
        "6": "https://ncert.nic.in/textbook/pdf/gesc1/{chapter:02d}.pdf",
        "7": "https://ncert.nic.in/textbook/pdf/gesc2/{chapter:02d}.pdf",
        "8": "https://ncert.nic.in/textbook/pdf/gesc3/{chapter:02d}.pdf",
        "9": "https://ncert.nic.in/textbook/pdf/gesc1/{chapter:02d}.pdf",
        "10": "https://ncert.nic.in/textbook/pdf/gesc2/{chapter:02d}.pdf",
    },
}

EXEMPLAR_BASE_URL = "https://ncert.nic.in/exemplar-problems.php"
EXEMPLAR_HTML_CLASS_URL = "https://ncert.nic.in/exemplar-problems.php?class={class_level}&subject={subject}"


def build_textbook_pdf_url(provenance: dict) -> Optional[str]:
    """Build PDF URL for NCERT textbook chapter."""
    subject = provenance.get("subject", "")
    class_level = str(provenance.get("class", ""))
    chapter = provenance.get("chapterNumber")

    if not subject or not class_level or chapter is None:
        return None

    patterns = TEXTBOOK_URL_PATTERNS.get(subject)
    if not patterns:
        return None

    url_template = patterns.get(class_level)
    if not url_template:
        return None

    return url_template.format(chapter=int(chapter))


def build_exemplar_url(provenance: dict) -> Optional[str]:
    subject = provenance.get("subject", "")
    class_level = str(provenance.get("class", ""))

    if not subject or not class_level:
        return None

    return EXEMPLAR_HTML_CLASS_URL.format(class_level=class_level, subject=subject)


def build_ncert_url(provenance: dict, source_kind: str = "CANONICAL") -> Optional[str]:
    if source_kind == "EXEMPLAR":
        return build_exemplar_url(provenance)

    if source_kind == "CANONICAL" or source_kind is None:
        url = build_textbook_pdf_url(provenance)
        if url:
            return url
        return build_exemplar_url(provenance)

    return build_textbook_pdf_url(provenance)


def get_subject_slug(subject: str) -> str:
    """Convert subject name to NCERT URL slug."""
    slug_map = {
        "Mathematics": "math",
        "Science": "sc",
        "English": "eng",
        "Physics": "phy",
        "Chemistry": "chem",
        "Biology": "bio",
        "Social Science": "socsc",
    }
    return slug_map.get(subject, subject.lower().replace(" ", ""))

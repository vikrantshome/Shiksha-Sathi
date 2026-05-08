"""Semantic verification of questions against web sources."""
import asyncio
from typing import List, Dict, Any
from ncert_scraper import WebVerifier
from config import ENABLE_NCERT_VERIFICATION


class NcertVerificationResult:
    def __init__(
        self,
        verified: bool,
        issues: List[str],
        fixes: List[Dict[str, Any]],
        source_found: bool,
        confidence: float,
        reasoning: str,
    ):
        self.verified = verified
        self.issues = issues
        self.fixes = fixes
        self.source_found = source_found
        self.confidence = confidence
        self.reasoning = reasoning


async def verify_question_ncert(question: dict, verifier: WebVerifier = None) -> NcertVerificationResult:
    if not ENABLE_NCERT_VERIFICATION:
        return NcertVerificationResult(
            verified=True,
            issues=[],
            fixes=[],
            source_found=True,
            confidence=1.0,
            reasoning="NCERT verification disabled",
        )

    own_verifier = verifier is None
    if own_verifier:
        verifier = WebVerifier()

    try:
        if own_verifier:
            await verifier.__aenter__()
        result = await verifier.verify_with_delay(
            question_text=question.get("text", ""),
            correct_answer=question.get("correctAnswer", ""),
            question_type=question.get("type", ""),
        )
    except Exception as e:
        return NcertVerificationResult(
            verified=False,
            issues=["ncert_fetch_failed"],
            fixes=[{
                "field": "verification",
                "issue": "ncert_fetch_failed",
                "suggestion": f"Failed to verify: {str(e)}",
            }],
            source_found=False,
            confidence=0.0,
            reasoning=f"Fetch failed: {str(e)}",
        )
    finally:
        if own_verifier:
            await verifier.__aexit__(None, None, None)

    issues = []
    fixes = []

    if not result.found:
        issues.append("ncert_source_missing")
        fixes.append({
            "field": "text",
            "issue": "ncert_source_missing",
            "suggestion": "Question not found in web sources — verify or remove",
        })

    if result.found and result.confidence < 0.5:
        issues.append("ncert_low_confidence_match")
        fixes.append({
            "field": "text",
            "issue": "ncert_low_confidence_match",
            "suggestion": f"Low confidence match ({result.confidence:.2f}) — manual review needed",
        })

    if result.found and result.answer:
        db_answer = str(question.get("correctAnswer", "")).strip().lower()
        web_answer = str(result.answer).strip().lower()
        if db_answer and web_answer and db_answer != web_answer:
            issues.append("answer_verification_failed")
            fixes.append({
                "field": "correctAnswer",
                "issue": "answer_verification_failed",
                "suggestion": f"DB answer '{db_answer}' differs from web answer '{web_answer}'",
            })

    verified = len(issues) == 0

    return NcertVerificationResult(
        verified=verified,
        issues=issues,
        fixes=fixes,
        source_found=result.found,
        confidence=result.confidence,
        reasoning=result.reasoning,
    )


async def batch_verify_questions(questions: List[dict]) -> List[NcertVerificationResult]:
    async with WebVerifier() as verifier:
        results = []
        for q in questions:
            result = await verify_question_ncert(q, verifier=verifier)
            results.append(result)
        return results

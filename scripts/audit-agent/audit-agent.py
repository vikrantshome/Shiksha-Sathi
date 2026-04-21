#!/usr/bin/env python3
"""
Enhanced Question Bank Audit Agent using NVIDIA NIM API (Kimi K2 Thinking model)
Detects and fixes question defects with WEB SEARCH for authoritative verification

Features:
- Uses moonshotai/kimi-k2-thinking model (best for reasoning)
- Web search: Uses crawl4ai to verify questions against authoritative sources (NCERT, etc.)
- NOT RAG: No longer uses flawed "ok" questions as examples
- Auto-fix issues when detected
"""

import argparse
import json
import logging
import os
import re
import subprocess
import sys
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Set, Tuple

from openai import OpenAI
from pymongo import MongoClient

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s,%(msecs)03d [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler("audit-agent.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


def web_search(query: str) -> Optional[str]:
    """Perform web search using crawl4ai CLI tool"""
    try:
        cmd = [
            "python",
            "-m",
            "crawl4ai",
            "--url",
            f"https://www.google.com/search?q={query}",
            "--format",
            "markdown",
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0 and result.stdout:
            logger.info(f"Web search completed for: {query[:50]}...")
            return result.stdout[:5000]  # Limit context size
    except FileNotFoundError:
        logger.warning("crawl4ai not installed, skipping web search")
    except Exception as e:
        logger.warning(f"Web search error: {e}")
    return None


def load_mongodb_uri() -> str:
    possible_paths = [
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.path.dirname(__file__), "..", ".env.local"),
        os.path.join(os.path.dirname(__file__), "..", "..", ".env.local"),
        os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env.local"),
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".env.local"),
    ]
    for env_path in possible_paths:
        env_path = os.path.abspath(env_path)
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    if line.strip().startswith("MONGODB_URI="):
                        uri = line.split("=", 1)[1].strip().strip('"')
                        return uri
    return os.environ.get(
        "MONGODB_URI",
        "mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha",
    )


def get_mongodb_connection() -> MongoClient:
    uri = load_mongodb_uri()
    client = MongoClient(uri)
    return client["shikshasathi"]


def load_api_key() -> str:
    # For worktrees, go up from .worktrees/audit-run/scripts/audit-agent to repo root
    possible_paths = [
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.path.dirname(__file__), "..", ".env.local"),
        os.path.join(os.path.dirname(__file__), "..", "..", ".env.local"),
        os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env.local"),
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".env.local"),
    ]
    for env_path in possible_paths:
        env_path = os.path.abspath(env_path)
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    if line.strip().startswith("NVIDIA_API_KEY="):
                        return line.split("=", 1)[1].strip()
    api_key = os.environ.get("NVIDIA_API_KEY")
    if not api_key:
        raise ValueError("NVIDIA_API_KEY not found in .env or environment")
    return api_key


def pre_validate_question(question: Dict) -> Tuple[bool, Optional[str]]:
    """Pre-validate question before LLM call to avoid wasted API costs."""
    q_text = str(question.get("text", question.get("question_text", ""))).strip()
    q_answer_raw = question.get("correctAnswer", question.get("answer", ""))
    # Convert answer to string if it's a dict/list (e.g., for matching questions)
    if isinstance(q_answer_raw, (dict, list)):
        q_answer = json.dumps(q_answer_raw)
    else:
        q_answer = str(q_answer_raw).strip()
    q_type = question.get("type", "")

    if len(q_text) < 10:
        return False, "too_short"

    # Control characters (except whitespace)
    if any(ord(c) < 32 and c not in "\n\t\r" for c in q_text):
        return False, "corrupted_control_chars"

    # Placeholder answer patterns
    placeholder_patterns = [
        r"^Explanation\s*:?\s*(None|Answer\s*:|See|Not provided)",
        r"^See detailed solution",
        r"^Model Response\s*:",
        r"^Answer:\s*See",
        r"^numerical factor needed",
        r"^reason required",
    ]
    if q_answer and any(re.search(p, q_answer, re.I) for p in placeholder_patterns):
        return False, "placeholder_answer"

    # Empty answer
    if not q_answer or q_answer.lower() in ["none", "n/a", "na", "not applicable"]:
        return False, "empty_answer"

    # Missing context references
    context_refs = [
        r"fig\.?\s*\d+",
        r"figure\s*\d+",
        r"question\s+\d+\s+above",
        r"above question",
        r"following table",
    ]
    if any(re.search(ref, q_text, re.I) for ref in context_refs):
        if len(q_text) < 100:
            return False, "missing_context"

    # Unsupported types
    unsupported_types = [
        "ESSAY",
        "LONG_ANSWER",
        "CONSTRUCTION",
        "MATCHING",
        "MULTI_PART",
        "MULTI_PART_SHORT_ANSWER",
        "LONG_DESCRIPTIVE",
    ]
    if q_type in unsupported_types:
        return False, "unsupported_type"

    return True, None


class AuthoritativeSourceFetcher:
    """Fetches authoritative content from NCERT and educational sources"""

    NCERT_BASE_URLS = [
        "https://ncert.nic.in/textbook.php",
        "https://www.ncert.nic.in/ncert-links",
    ]

    def __init__(self):
        self.search_cache: Dict[str, str] = {}

    def fetch_authoritative_content(
        self, question_text: str, class_num: str, subject: str = ""
    ) -> Optional[str]:
        """Fetch relevant authoritative content for a question"""
        cache_key = f"{class_num}:{question_text[:50]}"
        if cache_key in self.search_cache:
            return self.search_cache[cache_key]

        query = self._build_search_query(question_text, class_num, subject)
        content = web_search(query)

        if content:
            self.search_cache[cache_key] = content

        return content

    def _build_search_query(
        self, question_text: str, class_num: str, subject: str
    ) -> str:
        """Build search query for authoritative sources"""
        keywords = question_text[:100]
        query = f"NCERT Class {class_num} {keywords}"
        return query


class AuditAgent:
    def __init__(
        self,
        api_key: str,
        model: str = "moonshotai/kimi-k2-thinking",
        fallback_model: str = "minimaxai/minimax-m2.5",
        enable_web_search: bool = True,
    ):
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=api_key,
        )
        self.model = model
        self.fallback_model = fallback_model
        self.enable_web_search = enable_web_search
        self.source_fetcher = (
            AuthoritativeSourceFetcher() if enable_web_search else None
        )
        self.retry_system_prompt = """You are a JSON generator. Your ONLY task is to output valid JSON.

Respond with ONLY a JSON array, no explanations, no markdown, no code blocks:
[{"question_id": "id", "status": "ok"|"needs_fix", "issues": [], "auto_fixes": {}, "recommendation": "approve"|"needs_review"}]

DO NOT include any text before or after the JSON. Start with [ and end with ]."""

        self.system_prompt = """You are a question bank quality assurance expert specializing in Indian education (NCERT curriculum for Classes 6-12).

Your task is to analyze each question and respond with ONLY a valid JSON array (no other text).

## Response Format - STRICT JSON
[{"question_id": "id", "status": "ok"|"needs_fix"|"error", "issues": [], "auto_fixes": {}, "recommendation": "approve"|"needs_review"}]

IMPORTANT: Output must be valid JSON that can be parsed by Python json.loads(). 
- Use double quotes for all strings
- No trailing commas
- No comments or explanations
- No markdown code blocks
- Escape special characters properly

## Quality Rules
 1. **Type Matching**: TRUE_FALSE questions must have definite true/false answers, not explanations
 2. **Superscript Issues**: "a2b" should be "a²b", "x2" should be "x²"
 3. **Complete Explanations**: Answer must include justification, not just "Answer: True"
 4. **Single Question**: Each question should be self-contained, not multi-part
 5. **Valid Content**: No garbled text, date stamps, JS code, or nonsense
 6. **Placeholder Answers**: Reject answers like "reason required", "numerical factor needed"
 7. **Complete Questions**: No incomplete sentences or missing options
 8. **MCQ Type Detection**: If question text contains options like "(a)", "(b)", "(c)", "(d)" or "A)", "B)", "C)", "D)" and answer references these letters, it should be type MCQ not SHORT_ANSWER
 9. **Options in Answer**: If answer contains "(a)", "(b)", "(c)" or "option (a)", "option b" - the question likely has hidden MCQ options and should be converted to MCQ type with proper options extracted
10. **Embedded Options Detection**: If options field contains concatenated options like "7 (b) 8 (c) 9 (d) 10" - this is malformed. Extract properly: options=["7", "8", "9", "10"], answer="8"
11. **True/False Detection**: If answer is "True.", "False.", "true", "false", "Yes", "No" (without explanation), type should be TRUE_FALSE not SHORT_ANSWER
12. **Vague Questions**: If question asks "main message of the chapter" or "what is the theme" without specifying chapter/story name - INVALID. Fix: Add chapter name.
13. **MCQ Options in Question Text**: MCQ questions MUST include options in question text like "(a) option1 (b) option2". If options field exists but question text doesn't have them, ADD them.
14. **DESCRIPTIVE Type**: DESCRIPTIVE type should NOT have MCQ-style options (a,b,c,d). If options exist, change type to MCQ.
15. **Letter Answers**: If answer is "(a)", "(b)", "option a", convert to full option text. correctAnswer should be full text, not letter.
16. **Type-Answer Mismatch**: If question is "What is X?" and answer is definition/explanation, type should be DESCRIPTIVE or SHORT_ANSWER, not TRUE_FALSE.
17. **Vague Definitions**: If answer is full paragraph definition for "What is adaptation?", type should be DESCRIPTIVE or SHORT_ANSWER, not TRUE_FALSE.
18. **Embedded MCQ in SHORT_ANSWER**: If type is SHORT_ANSWER but question text contains multiple option patterns like "(A)", "(B)", "(C)", "(D)" - this is actually MCQ. Convert to MCQ type and extract options.
19. **Concatenated Options**: If question text has options merged like "1:10 10:1 1:1 100:1" without separators - extract and create proper MCQ format.
20. **Multi-part TRUE_FALSE**: If TRUE_FALSE question contains multiple sub-statements like "(a) statement (b) statement" - these should be split into separate questions. One TRUE_FALSE question = one statement only.
21. **TRUE_FALSE Must Have Options**: TRUE_FALSE questions should have "True" and "False" as explicit options in question text or options field. If not provided, add them.
22. **MCQ Must Have 4 Options**: If type is MCQ but options field is empty or has < 4 options, this is invalid. Search trusted sources for actual question with options. If not found, generate 4 plausible options based on question context. Options should be realistic distractors.
23. **TRUE_FALSE Answer Cleanup**: If correctAnswer contains "Explanation:" or extra text like "True because...", extract just "True" or "False". Strip everything after first word if matches true/false.
24. **MCQ Letter → Full Text**: If correctAnswer is "(a)", "(b)", "(c)", "(d)" or just "a", "b", "c", "d", and options array exists, convert to the full option text. Map letter index to options list.
25. **Extract MCQ Options from Text**: If options field is empty but question_text contains "(a) text (b) text (c) text (d) text" patterns, extract them into options array and ensure answer references full text. Handle uppercase letters and variations with periods.
26. **Invalid Type Conversion**: For unsupported types:
    - LONG_ANSWER → DESCRIPTIVE (if answer is paragraph)
    - ESSAY → DESCRIPTIVE (if answer is explanatory text)
    - CONSTRUCTION → SHORT_ANSWER (if answer is brief)
    - MATCHING → needs_review (flag for manual handling)
27. **Multi-part Detection**: If question_text contains multiple sub-questions labeled (a), (b), (c), (d) and type is not MCQ, either split into separate questions (if independent) or change type to MULTI_PART_SHORT_ANSWER if they are meant to be answered together. Flag as error if unclear.

## MATH NOTATION VALIDATION (CRITICAL)
Check for suspicious empty spaces where math operators should be:
- Pattern "X (X Y)" where X is variable and Y is number - likely means "X (X ± Y)" or similar
- Look at the ANSWER and OPTIONS to deduce the correct operator
- For "n (n 1)" - check if answer is "n(n-1)" or "n(n+1)" from options
- Use THINKING REASONING: analyze options to determine operator
- If question has garbled math with empty spaces:
  1. Look at correct answer to determine operator
  2. Look at options for clues
  3. Provide corrected "question" field in auto_fixes

Example: If question shows "n (n 1)" and correct answer is "n(n-1)/2", missing operator is "-". Fix should replace "n (n 1)" with "n(n-1)".

## Analysis Guidelines
- For MATH: Check formula correctness, proper notation (use ², ³, √, π)
- For SCIENCE: Verify scientific accuracy, proper terminology
- For LANGUAGE: Check grammar, proper word usage, spelling
- Use provided authoritative source content to verify factual accuracy when available

## Trusted Source Verification (CRITICAL)
When authoritative content is provided:
1. Compare question and answer with source
2. If source has a DIFFERENT answer, note this as issue and use verified answer
3. Note the source in audit_result
4. Verify the question TYPE matches source format

Trusted sources (in priority order):
- learncbse.in (NCERT solutions, exemplar problems)
- vedantu.com (NCERT solutions, video explanations)
- tiwariacademy.com (NCERT Hindi/English medium)
- cbselabs.com (CBSE labs, sample papers)
- doubtnut.com (NCERT solutions, video answers)

Respond ONLY with JSON array, no explanations."""

    def _build_prompt(
        self, question: Dict, authoritative_content: Optional[str] = None
    ) -> tuple:
        """Build prompt with optional authoritative source content"""

        # Add authoritative content if available
        source_context = ""
        if authoritative_content:
            source_context = f"""
## Authoritative Reference (from web search):
{authoritative_content[:2000]}
"""

        prompt = self.system_prompt + source_context

        q_text = question.get("text", question.get("question_text", ""))
        q_type = question.get("type", "UNKNOWN")
        q_answer = question.get("correctAnswer", question.get("answer", ""))
        q_explanation = question.get("explanation", "")
        q_class = question.get("provenance", {}).get("class", "unknown")
        q_subject = question.get("provenance", {}).get("subject", "")

        user_prompt = f"""## Question to Analyze
Question ID: {question["_id"]}
Class: {q_class}
Subject: {q_subject}
Type: {q_type}
Question: {q_text}
Answer: {q_answer}
Explanation: {q_explanation}

Analyze and respond with JSON array."""

        return prompt, user_prompt

    def audit_questions(self, questions: List[Dict]) -> List[Dict]:
        if not questions:
            return []

        question = questions[0]

        # Pre-validation: Skip obvious problems to save API costs
        is_valid, error_category = pre_validate_question(question)
        if not is_valid:
            q_id = str(question["_id"])
            logger.warning(f"  {q_id}: Pre-validation failed: {error_category}")
            return [
                {
                    "question_id": q_id,
                    "status": "error",
                    "issues": [f"Pre-validation failed: {error_category}"],
                    "error_category": error_category,
                    "recommendation": "manual_review"
                    if error_category in ["corrupted_control_chars", "missing_context"]
                    else "reject",
                }
            ]

        # Fetch authoritative content from web search
        authoritative_content = None
        if self.source_fetcher and self.enable_web_search:
            q_text = question.get("text", question.get("question_text", ""))
            q_class = question.get("provenance", {}).get("class", "6")
            q_subject = question.get("provenance", {}).get("subject", "")
            try:
                authoritative_content = self.source_fetcher.fetch_authoritative_content(
                    q_text, q_class, q_subject
                )
            except Exception as e:
                logger.warning(f"Web search failed: {e}")

        prompt, user_prompt = self._build_prompt(question, authoritative_content)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                max_tokens=4096,
            )

            message = response.choices[0].message
            content = message.content or message.reasoning or ""

            # First attempt with normal parsing
            results = self._parse_response(content, questions)

            # Check if we got valid results (not all parse errors)
            if results and all(
                r.get("status") == "error" and "Parse error" in str(r.get("issues", []))
                for r in results
            ):
                # Retry with enhanced parsing
                logger.info("First parse failed, retrying with enhanced parsing")
                results = self._parse_response_enhanced(content, questions)

            # If still failing, try with simpler prompt
            if results and all(
                r.get("status") == "error" and "Parse error" in str(r.get("issues", []))
                for r in results
            ):
                logger.info("Enhanced parsing failed, retrying with simple prompt")
                results = self._retry_with_simple_prompt(question)

            # Check if we still have parse errors - try fallback model (ANY parse error trigger)
            if any(
                (
                    r.get("status") == "error"
                    and "Parse error" in str(r.get("issues", []))
                )
                or r.get("error_category") == "MISSING_RESULT"
                for r in results
            ):
                logger.info(
                    f"Parse errors found, retrying with fallback model: {self.fallback_model}"
                )
                results = self._retry_with_fallback_model(question)

            return results

        except Exception as e:
            error_str = str(e)
            # Check for API errors (504 Gateway Timeout, rate limits, etc.)
            if (
                "504" in error_str
                or "Gateway Timeout" in error_str
                or "rate_limit" in error_str
                or "429" in error_str
            ):
                logger.warning(
                    f"API error: {error_str}, retrying with fallback model: {self.fallback_model}"
                )
                return self._retry_with_fallback_model(question)

            logger.error(f"API error: {e}")
            return [{"error": str(e)} for _ in questions]

    def _parse_response_enhanced(
        self, content: str, questions: List[Dict]
    ) -> List[Dict]:
        """Enhanced JSON parsing with multiple fallback strategies."""
        results = []
        content = content.strip()

        # Remove markdown code blocks
        content = re.sub(r"```json", "", content)
        content = re.sub(r"```", "", content)
        content = re.sub(r"<thinking>.*?</thinking>", "", content, flags=re.DOTALL)

        # Strategy 1: Find JSON array
        start_idx = content.find("[")
        if start_idx == -1:
            start_idx = content.find("{")

        if start_idx != -1:
            json_str = content[start_idx:]

            # Try to find matching closing bracket
            depth = 0
            end_idx = 0
            in_string = False
            escape = False
            for i, c in enumerate(json_str):
                if escape:
                    escape = False
                    continue
                if c == "\\":
                    escape = True
                    continue
                if c == '"':
                    in_string = not in_string
                    continue
                if not in_string:
                    if c == "[" or c == "{":
                        depth += 1
                    elif c == "]" or c == "}":
                        depth -= 1
                    if depth == 0:
                        end_idx = i + 1
                        break

            if end_idx > 0:
                json_str = json_str[:end_idx]

                # Try original
                try:
                    data = json.loads(json_str)
                    if isinstance(data, list):
                        results.extend(data)
                    elif isinstance(data, dict):
                        results.append(data)
                    if results:
                        return results[: len(questions)]
                except:
                    pass

                # Try fixing trailing commas
                try:
                    json_str_fixed = re.sub(r",(\s*[}\]])", r"\1", json_str)
                    data = json.loads(json_str_fixed)
                    if isinstance(data, list):
                        results.extend(data)
                    elif isinstance(data, dict):
                        results.append(data)
                    if results:
                        return results[: len(questions)]
                except:
                    pass

                # Try extracting individual JSON objects
                try:
                    obj_matches = re.finditer(
                        r"\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}", json_str
                    )
                    for match in obj_matches:
                        try:
                            obj = json.loads(match.group())
                            results.append(obj)
                        except:
                            continue
                    if results:
                        return results[: len(questions)]
                except:
                    pass

        # If all strategies fail, return error
        while len(results) < len(questions):
            results.append(
                {
                    "status": "error",
                    "issues": ["Parse error: Missing result for question"],
                    "error_category": "MISSING_RESULT",
                    "recommendation": "retry",
                }
            )
        return results[: len(questions)]

    def _retry_with_simple_prompt(self, question: Dict) -> List[Dict]:
        """Retry with simpler prompt that outputs minimal JSON."""
        q_text = question.get("text", question.get("question_text", ""))
        q_type = question.get("type", "UNKNOWN")
        q_answer = question.get("correctAnswer", question.get("answer", ""))
        q_id = str(question["_id"])

        user_prompt = f"""Question ID: {q_id}
Type: {q_type}
Question: {q_text}
Answer: {q_answer}

Output ONLY valid JSON array like:
[{{"question_id": "{q_id}", "status": "ok", "issues": [], "auto_fixes": {{}}, "recommendation": "approve"}}]

No other text."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.retry_system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.1,
                max_tokens=1000,
            )

            message = response.choices[0].message
            content = message.content or message.reasoning or ""

            # Try to parse
            return self._parse_response_enhanced(content, [question])

        except Exception as e:
            error_str = str(e)
            if (
                "504" in error_str
                or "Gateway Timeout" in error_str
                or "rate_limit" in error_str
                or "429" in error_str
            ):
                logger.warning(
                    f"Simple prompt retry failed: {error_str}, trying fallback model"
                )
                return self._retry_with_fallback_model(question)

            logger.error(f"Simple prompt retry failed: {e}")
            return [
                {
                    "status": "error",
                    "issues": ["Retry with simple prompt failed"],
                    "error_category": "MISSING_RESULT",
                    "recommendation": "manual_review",
                }
            ]

    def _retry_with_fallback_model(self, question: Dict) -> List[Dict]:
        """Retry with fallback model when primary model returns empty/invalid response."""
        q_text = question.get("question_text", "")
        q_id = question.get("question_id", "")
        q_type = question.get("type", "SHORT_ANSWER")
        q_answer = question.get("correctAnswer", "")

        user_prompt = f"""Analyze this question and return JSON result:

Question: {q_text}
Type: {q_type}
Answer: {q_answer}

JSON format (ONLY):
[{{"question_id": "{q_id}", "status": "ok"|"needs_fix"|"error", "issues": [], "auto_fixes": {{}}, "recommendation": "approve"|"needs_review"}}]"""

        try:
            response = self.client.chat.completions.create(
                model=self.fallback_model,
                messages=[
                    {"role": "system", "content": self.retry_system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.1,
                max_tokens=1000,
            )

            message = response.choices[0].message
            content = message.content or message.reasoning or ""

            logger.info(f"Fallback model returned: {content[:100]}...")
            return self._parse_response_enhanced(content, [question])

        except Exception as e:
            logger.error(f"Fallback model failed: {e}")
            return [
                {
                    "status": "error",
                    "issues": ["Fallback model retry failed"],
                    "error_category": "MISSING_RESULT",
                    "recommendation": "manual_review",
                }
            ]

    def _parse_response(self, content: str, questions: List[Dict]) -> List[Dict]:
        results = []

        # Clean up the response
        content = content.strip()

        # Remove markdown code blocks
        content = re.sub(r"```json", "", content)
        content = re.sub(r"```", "", content)

        # Remove thinking tags
        content = re.sub(r"<thinking>.*?</thinking>", "", content, flags=re.DOTALL)

        # Find JSON array or object
        start_idx = content.find("[")
        if start_idx == -1:
            start_idx = content.find("{")

        if start_idx != -1:
            json_str = content[start_idx:]

            # Try to find the end of the JSON
            if json_str.startswith("["):
                # Find matching closing bracket
                depth = 0
                end_idx = 0
                in_string = False
                escape = False
                for i, c in enumerate(json_str):
                    if escape:
                        escape = False
                        continue
                    if c == "\\":
                        escape = True
                        continue
                    if c == '"':
                        in_string = not in_string
                        continue
                    if not in_string:
                        if c == "[" or c == "{":
                            depth += 1
                        elif c == "]" or c == "}":
                            depth -= 1
                            if depth == 0:
                                end_idx = i + 1
                                break

                if end_idx > 0:
                    json_str = json_str[:end_idx]

            # Try to parse
            try:
                data = json.loads(json_str)
                if isinstance(data, list):
                    results.extend(data)
                elif isinstance(data, dict):
                    results.append(data)
            except json.JSONDecodeError as e:
                # Try to fix common issues and retry
                try:
                    # Remove trailing commas
                    json_str_fixed = re.sub(r",(\s*[}\]])", r"\1", json_str)
                    data = json.loads(json_str_fixed)
                    if isinstance(data, list):
                        results.extend(data)
                    elif isinstance(data, dict):
                        results.append(data)
                except:
                    logger.warning(f"JSON parse error: {e}")
                    logger.warning(f"Content sample: {json_str[:200]}")

        while len(results) < len(questions):
            results.append(
                {
                    "status": "error",
                    "issues": ["Parse error: Missing result for question"],
                    "error_category": "MISSING_RESULT",
                    "recommendation": "retry",
                }
            )

        return results[: len(questions)]


def apply_rule_based_fixes(question: Dict, result: Dict) -> Dict:
    """Apply rule-based fixes as fallback when LLM missed fixable issues."""
    updates = {}
    q_text = str(question.get("text", "")).strip()
    q_type = question.get("type", "").upper()
    q_answer_raw = question.get("correctAnswer", "")
    # Convert to string if dict/list (e.g., matching questions)
    if isinstance(q_answer_raw, (dict, list)):
        q_answer = json.dumps(q_answer_raw)
    else:
        q_answer = str(q_answer_raw).strip()
    q_options = question.get("options", [])

    # Rule 23: TRUE_FALSE answer cleanup
    if q_type == "TRUE_FALSE" and q_answer:
        cleaned = re.sub(r"^Explanation\s*:?\s*", "", q_answer, flags=re.I).strip()
        first_word = cleaned.split()[0] if cleaned else ""
        if first_word.lower() in ["true", "false"]:
            cleaned = first_word
        if cleaned.lower() in ["true", "false"]:
            updates["correctAnswer"] = cleaned.capitalize()
            result.setdefault("issues", []).append(
                "TRUE_FALSE answer contained explanation"
            )
            result.setdefault("auto_fixes", {})["answer"] = updates["correctAnswer"]

    # Rule 24: MCQ letter -> full text conversion
    if q_type == "MCQ" and q_answer and q_options:
        letter_match = re.match(r"^\(?([a-d])\)?$", q_answer, re.I)
        if letter_match:
            letter = letter_match.group(1).lower()
            idx = ord(letter) - ord("a")
            if 0 <= idx < len(q_options):
                updates["correctAnswer"] = q_options[idx]
                result.setdefault("issues", []).append(
                    "MCQ answer was letter, converted to full text"
                )

    # Rule 25: Extract MCQ options from text
    if q_type == "MCQ" and not q_options:
        pattern = r"\(([a-d])\)\s*([^()]+?)(?=\s*\([a-d]\)|$)"
        matches = re.findall(pattern, q_text, re.I)
        if len(matches) >= 4:
            sorted_matches = sorted(matches, key=lambda m: m[0].lower())
            options = [text.strip() for _, text in sorted_matches[:4]]
            if len(options) == 4:
                updates["options"] = options
                if not any(f"({chr(97 + i)})" in q_text.lower() for i in range(4)):
                    opt_str = " ".join(
                        [f"({chr(97 + i)}) {opt}" for i, opt in enumerate(options)]
                    )
                    updates["text"] = f"{q_text.strip()} {opt_str}"
                result.setdefault("issues", []).append(
                    "Extracted MCQ options from question text"
                )
                result.setdefault("auto_fixes", {})["options"] = options

    # Rule 26: Invalid type conversion (enhanced)
    if q_type in ["LONG_ANSWER", "ESSAY", "CONSTRUCTION", "FILL_IN_BLANKS"]:
        if q_type == "FILL_IN_BLANKS":
            updates["type"] = "SHORT_ANSWER"
            result.setdefault("issues", []).append(
                "Converted FILL_IN_BLANKS to SHORT_ANSWER"
            )
        elif q_type in ["LONG_ANSWER", "ESSAY"]:
            if len(q_answer.split()) > 20:
                updates["type"] = "DESCRIPTIVE"
            else:
                updates["type"] = "SHORT_ANSWER"
        else:
            updates["type"] = "SHORT_ANSWER"
        result.setdefault("issues", []).append(
            f"Converted invalid type {q_type} to {updates['type']}"
        )
        result.setdefault("auto_fixes", {})["type"] = updates["type"]

    # Rule 28: Fix placeholder answers
    placeholder_patterns = [
        (r"^Explanation\s*:?\s*(None|Answer\s*:|See|Not provided)", ""),
        (r"^See detailed solution", ""),
        (r"^Model Response\s*:", ""),
        (r"^Answer:\s*See", ""),
        (r"^numerical factor needed", ""),
        (r"^reason required", ""),
        (r"^Please refer to.*", ""),
        (r"^See attached.*", ""),
    ]

    for pattern, replacement in placeholder_patterns:
        if re.search(pattern, q_answer, re.I):
            # Try to extract actual answer from explanation field
            q_explanation = str(question.get("explanation", "")).strip()
            if q_explanation and len(q_explanation.split()) > 2:
                updates["correctAnswer"] = q_explanation
                result.setdefault("issues", []).append(
                    "Replaced placeholder with explanation"
                )
                result.setdefault("auto_fixes", {})["answer"] = q_explanation
                break
            else:
                # Mark for manual review
                result["recommendation"] = "needs_review"
                break

    # Rule 29: Fix corrupted control characters
    if question.get("text"):
        text = question["text"]
        cleaned = "".join(c for c in text if ord(c) >= 32 or c in "\n\t\r")
        if cleaned != text:
            updates["text"] = cleaned
            result.setdefault("issues", []).append(
                "Removed control characters from question"
            )
            result.setdefault("auto_fixes", {})["text"] = cleaned

    if question.get("correctAnswer"):
        ans = str(question.get("correctAnswer", ""))
        cleaned = "".join(c for c in ans if ord(c) >= 32 or c in "\n\t\r")
        if cleaned != ans:
            updates["correctAnswer"] = cleaned
            result.setdefault("issues", []).append(
                "Removed control characters from answer"
            )
            result.setdefault("auto_fixes", {})["answer"] = cleaned

    # Rule 27: Multi-part detection
    if re.search(r"\([a-d]\)\s*\.?\s*[A-Z]", q_text) and q_type not in [
        "MCQ",
        "MULTI_PART_SHORT_ANSWER",
    ]:
        result.setdefault("issues", []).append(
            "Multi-part question with inappropriate type"
        )
        result["recommendation"] = "needs_review"

    return updates


def process_result(
    question: Dict,
    result: Dict,
    db,
    dry_run: bool,
    results_file: str,
    stats: Dict[str, int],
) -> None:
    question_id = str(question["_id"])

    try:
        result["question_id"] = question_id
        result["question_text"] = question.get(
            "text", question.get("question_text", "")
        )
        result["type"] = question.get("type", "UNKNOWN")
        result["correctAnswer"] = question.get(
            "correctAnswer", question.get("answer", "")
        )
        result["timestamp"] = datetime.utcnow().isoformat()

        # Write to JSONL results file
        with open(results_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(result) + "\n")

        if result.get("status") == "ok":
            stats["skipped"] += 1
            logger.info(
                f"  {question_id}: OK - {result.get('recommendation', 'approve')}"
            )
            if not dry_run:
                db.questions.update_one(
                    {"_id": question["_id"]},
                    {
                        "$set": {
                            "audit_status": "ok",
                            "audit_result": ["approved"],
                            "audit_timestamp": datetime.utcnow().isoformat(),
                            "review_status": "PUBLISHED",
                        }
                    },
                )
        elif result.get("status") == "needs_fix":
            stats["fixed"] += 1
            issues = result.get("issues", [])
            logger.info(f"  {question_id}: FIXED - {', '.join(issues[:2])}")

            if not dry_run:
                # Collect LLM auto_fixes
                updates = {}
                auto_fixes = result.get("auto_fixes", {})

                if "type" in auto_fixes:
                    updates["type"] = auto_fixes["type"]
                if "explanation" in auto_fixes:
                    updates["explanation"] = auto_fixes["explanation"]
                if "answer" in auto_fixes:
                    updates["correctAnswer"] = auto_fixes["answer"]
                if "text" in auto_fixes:
                    updates["text"] = auto_fixes["text"]
                if "question" in auto_fixes:
                    updates["text"] = auto_fixes["question"]
                if "options" in auto_fixes:
                    updates["options"] = auto_fixes["options"]
                if "choices" in auto_fixes:
                    updates["options"] = auto_fixes["choices"]

                # Apply LLM fixes first
                if updates:
                    db.questions.update_one(
                        {"_id": question["_id"]},
                        {
                            "$set": {
                                **updates,
                                "audit_status": "fixed",
                                "audit_result": result.get("issues", []),
                                "audit_timestamp": datetime.utcnow().isoformat(),
                                "review_status": "PUBLISHED",
                            }
                        },
                    )
                    logger.info(f"    Applied LLM fixes: {list(updates.keys())}")

                # Apply rule-based fixes as fallback
                q_updated = db.questions.find_one({"_id": question["_id"]})
                if q_updated:
                    combined = {
                        "status": result.get("status", "needs_fix"),
                        "issues": result.get("issues", []),
                        "auto_fixes": auto_fixes,
                    }
                    rule_updates = apply_rule_based_fixes(q_updated, combined)
                    if rule_updates:
                        db.questions.update_one(
                            {"_id": question["_id"]},
                            {
                                "$set": {
                                    **rule_updates,
                                    "audit_status": "fixed",
                                    "audit_result": result.get("issues", []),
                                    "audit_timestamp": datetime.utcnow().isoformat(),
                                    "review_status": "PUBLISHED",
                                }
                            },
                        )
                        logger.info(
                            f"    Applied rule-based fixes: {list(rule_updates.keys())}"
                        )
                        updates.update(rule_updates)

                # Post-process: Convert letter answers to full text (legacy)
                q_updated = db.questions.find_one({"_id": question["_id"]})
                if q_updated and q_updated.get("type") == "MCQ":
                    answer = q_updated.get("correctAnswer", "")
                    options = q_updated.get("options", [])
                    if answer and len(answer) <= 5 and "(" in answer:
                        letter = (
                            answer.strip().replace("(", "").replace(")", "").lower()
                        )
                        if letter in ["a", "b", "c", "d"] and options:
                            idx = ord(letter) - ord("a")
                            if 0 <= idx < len(options):
                                db.questions.update_one(
                                    {"_id": question["_id"]},
                                    {"$set": {"correctAnswer": options[idx]}},
                                )
                                logger.info(
                                    f"    Converted letter answer to full text: {options[idx]}"
                                )

                # Post-process: Add options to question text if missing
                q_check = db.questions.find_one({"_id": question["_id"]})
                if q_check and q_check.get("type") == "MCQ":
                    q_text = q_check.get("text", "")
                    opts = q_check.get("options", [])
                    if opts and not any(
                        f"({chr(97 + i)})" in q_text.lower()
                        or f"({chr(65 + i)})" in q_text
                        for i in range(len(opts))
                    ):
                        opt_str = " ".join(
                            [f"({chr(97 + i)}) {opt}" for i, opt in enumerate(opts)]
                        )
                        new_text = f"{q_text.strip()} {opt_str}"
                        db.questions.update_one(
                            {"_id": question["_id"]}, {"$set": {"text": new_text}}
                        )
                        logger.info(f"    Added options to question text")

                if updates:
                    logger.info(f"    Applied fixes: {list(updates.keys())}")
                else:
                    logger.warning(
                        f"    No fixes could be applied despite needs_fix status"
                    )
                    db.questions.update_one(
                        {"_id": question["_id"]},
                        {
                            "$set": {
                                "audit_status": "error",
                                "audit_result": [
                                    "No auto_fixes provided and rule-based fixes not applicable"
                                ],
                                "audit_timestamp": datetime.utcnow().isoformat(),
                            }
                        },
                    )
        else:
            stats["errors"] += 1
            logger.warning(
                f"  {question_id}: ERROR - {result.get('issues', ['Unknown'])}"
            )
            if not dry_run:
                update_doc = {
                    "audit_status": "error",
                    "audit_result": result.get("issues", ["Parse error"]),
                    "audit_errors": str(result.get("error", "Parse error")),
                    "audit_timestamp": datetime.utcnow().isoformat(),
                }
                # Add error_category if present (from pre-validation or parse categorization)
                if result.get("error_category"):
                    update_doc["error_category"] = result["error_category"]
                db.questions.update_one({"_id": question["_id"]}, {"$set": update_doc})

        stats["processed"] += 1

    except Exception as e:
        logger.error(f"Error processing result: {e}")
        stats["errors"] += 1


def audit_class(
    db,
    agent: AuditAgent,
    class_num: str,
    batch_size: int = 1,
    dry_run: bool = True,
    statuses: List[str] = None,
    results_file: str = "audit-results.jsonl",
    processed_ids: Optional[Set[str]] = None,
) -> Dict[str, int]:
    """Audit all questions for a given class number."""
    if statuses is None:
        statuses = ["DRAFT", "PUBLISHED", "REVIEW", "REJECTED"]

    if processed_ids is None:
        processed_ids = set()

    stats = {"processed": 0, "fixed": 0, "skipped": 0, "errors": 0}
    total_processed = 0

    for status in statuses:
        query = {
            "provenance.class": class_num,
            "review_status": status,
        }
        questions = list(db.questions.find(query))

        if not questions:
            continue

        logger.info(f"Class {class_num}, Status '{status}': {len(questions)} questions")

        batch = []
        for q in questions:
            if str(q["_id"]) in processed_ids:
                stats["skipped"] += 1
                continue

            batch.append(q)

            if len(batch) >= batch_size:
                results = agent.audit_questions(batch)
                for question, result in zip(batch, results):
                    result["class"] = class_num
                    result["status_db"] = status
                    process_result(question, result, db, dry_run, results_file, stats)
                batch = []
                total_processed += len(results)
                logger.info(f"Progress: {total_processed} for Class {class_num}")
                time.sleep(0.5)

        if batch:
            results = agent.audit_questions(batch)
            for question, result in zip(batch, results):
                result["class"] = class_num
                result["status_db"] = status
                process_result(question, result, db, dry_run, results_file, stats)
            total_processed += len(results)
            logger.info(f"Progress: {total_processed} for Class {class_num}")

    logger.info(f"Completed Class {class_num}: {total_processed} processed")
    return stats


def load_processed_ids(results_file: str) -> Set[str]:
    """Load already processed question IDs"""
    processed = set()
    if os.path.exists(results_file):
        with open(results_file, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    d = json.loads(line)
                    processed.add(d["question_id"])
                except json.JSONDecodeError:
                    pass
    return processed


def main():
    parser = argparse.ArgumentParser(
        description="Enhanced Question Bank Audit Agent with Web Search"
    )
    parser.add_argument(
        "--class-num",
        help="Class number to audit (optional)",
    )
    parser.add_argument("--batch-size", type=int, default=1, help="Batch size")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=False,
        help="Dry run mode (no changes)",
    )
    parser.add_argument(
        "--model",
        default="moonshotai/kimi-k2-thinking",
        help="Primary model to use (default: moonshotai/kimi-k2-thinking)",
    )
    parser.add_argument(
        "--fallback-model",
        default="minimaxai/minimax-m2.5",
        help="Fallback model when primary returns empty result (default: minimaxai/minimax-m2.5)",
    )
    parser.add_argument(
        "--classes",
        nargs="+",
        default=["6", "7", "8", "9", "10", "11", "12"],
        help="Classes to audit",
    )
    parser.add_argument(
        "--results-file",
        default="audit-results.jsonl",
        help="Results file path",
    )
    parser.add_argument(
        "--no-web-search",
        action="store_true",
        help="Disable web search for authoritative verification",
    )
    parser.add_argument(
        "--retry-errors",
        action="store_true",
        help="Only process questions with audit_status=error",
    )
    parser.add_argument(
        "--fix-empty-answers",
        action="store_true",
        help="Generate answers for questions with empty_answer error using LLM",
    )
    parser.add_argument(
        "--fix-missing-result",
        action="store_true",
        help="Retry questions with MISSING_RESULT error using simple prompt",
    )
    parser.add_argument(
        "--fix-unsupported-type",
        action="store_true",
        help="Convert unsupported types to supported types",
    )
    parser.add_argument(
        "--fix-placeholder-answer",
        action="store_true",
        help="Generate answers for questions with placeholder_answer error using LLM",
    )
    parser.add_argument(
        "--fix-corrupted-chars",
        action="store_true",
        help="Strip and fix corrupted_control_chars errors, re-validate with LLM if needed",
    )
    args = parser.parse_args()

    logger.info(f"Model: {args.model}")
    logger.info(f"Batch size: {args.batch_size}")
    logger.info(f"Dry run: {args.dry_run}")
    logger.info(f"Web search: {not args.no_web_search}")

    try:
        db = get_mongodb_connection()
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        return 1

    api_key = load_api_key()
    agent = AuditAgent(
        api_key,
        args.model,
        args.fallback_model,
        enable_web_search=not args.no_web_search,
    )

    processed_ids = load_processed_ids(args.results_file)
    logger.info(f"Already processed: {len(processed_ids)} questions")

    classes_to_process = [args.class_num] if args.class_num else args.classes

    total_stats = {"processed": 0, "fixed": 0, "skipped": 0, "errors": 0}

    # Handle retry mode - query only error questions
    if args.retry_errors:
        for class_num in classes_to_process:
            query = {"provenance.class": class_num, "audit_status": "error"}
            error_questions = list(db.questions.find(query))
            logger.info(
                f"Class {class_num}: {len(error_questions)} error questions to retry"
            )

            # Process error questions
            if error_questions:
                for q in error_questions:
                    results = agent.audit_questions([q])
                    for question, result in zip([q], results):
                        result["class"] = class_num
                        result["status_db"] = "error_retry"
                        process_result(
                            question,
                            result,
                            db,
                            args.dry_run,
                            args.results_file,
                            total_stats,
                        )
                    time.sleep(0.5)

        logger.info("=== Retry Complete ===")
        logger.info(
            f"Processed: {total_stats['processed']}, Fixed: {total_stats['fixed']}, OK: {total_stats['skipped']}, Errors: {total_stats['errors']}"
        )
        return 0

    # Handle empty_answer fix mode - generate answers using LLM directly
    if args.fix_empty_answers:
        from openai import OpenAI

        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=api_key,
        )

        for class_num in classes_to_process:
            query = {
                "provenance.class": class_num,
                "audit_status": "error",
                "error_category": "empty_answer",
            }
            empty_questions = list(db.questions.find(query))
            logger.info(
                f"Class {class_num}: {len(empty_questions)} empty answer questions"
            )

            for i, q in enumerate(empty_questions):
                q_id = str(q["_id"])
                q_text = q.get("text", q.get("question_text", ""))
                q_type = q.get("type", "SHORT_ANSWER")

                # Generate answer using LLM
                prompt = f"""Given this question, provide a correct and complete answer.

Question Type: {q_type}
Question: {q_text}

Respond with ONLY the answer text, no explanations or JSON."""

                try:
                    response = client.chat.completions.create(
                        model="mistralai/mistral-small-4-119b-2603",
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.1,
                        max_tokens=500,
                    )
                    answer = response.choices[0].message.content.strip()

                    # Update question with generated answer
                    if not args.dry_run:
                        db.questions.update_one(
                            {"_id": q["_id"]},
                            {
                                "$set": {
                                    "correctAnswer": answer,
                                    "audit_status": "fixed",
                                    "audit_result": [
                                        "Answer generated by LLM for empty_answer"
                                    ],
                                    "audit_timestamp": datetime.utcnow().isoformat(),
                                }
                            },
                        )
                        total_stats["fixed"] += 1
                    else:
                        total_stats["skipped"] += 1

                    logger.info(
                        f"[{i + 1}/{len(empty_questions)}] {q_id}: Generated answer"
                    )

                except Exception as e:
                    logger.error(f"Error generating answer for {q_id}: {e}")
                    total_stats["errors"] += 1

                time.sleep(0.3)  # Rate limiting

                # Log progress every 50
                if (i + 1) % 50 == 0:
                    logger.info(
                        f"Progress: {i + 1}/{len(empty_questions)} for Class {class_num}"
                    )

        logger.info("=== Empty Answer Fix Complete ===")
        logger.info(f"Fixed: {total_stats['fixed']}, Errors: {total_stats['errors']}")
        return 0

    # Handle MISSING_RESULT fix mode - retry with simple prompt
    if args.fix_missing_result:
        for class_num in classes_to_process:
            query = {
                "provenance.class": class_num,
                "audit_status": "error",
                "error_category": "MISSING_RESULT",
            }
            missing_questions = list(db.questions.find(query))
            logger.info(
                f"Class {class_num}: {len(missing_questions)} MISSING_RESULT questions"
            )

            for i, q in enumerate(missing_questions):
                results = agent.audit_questions([q])
                for question, result in zip([q], results):
                    result["class"] = class_num
                    result["status_db"] = "missing_result_fix"
                    process_result(
                        question,
                        result,
                        db,
                        args.dry_run,
                        args.results_file,
                        total_stats,
                    )
                time.sleep(0.5)

                if (i + 1) % 50 == 0:
                    logger.info(
                        f"Progress: {i + 1}/{len(missing_questions)} for Class {class_num}"
                    )

        logger.info("=== MISSING_RESULT Fix Complete ===")
        logger.info(
            f"Processed: {total_stats['processed']}, Fixed: {total_stats['fixed']}, Errors: {total_stats['errors']}"
        )
        return 0

    # Handle unsupported_type fix mode
    if args.fix_unsupported_type:
        type_mapping = {
            "LONG_ANSWER": "DESCRIPTIVE",
            "ESSAY": "DESCRIPTIVE",
            "CONSTRUCTION": "SHORT_ANSWER",
            "FILL_IN_BLANKS": "SHORT_ANSWER",
            "MATCHING": "SHORT_ANSWER",
            "MULTI_PART": "SHORT_ANSWER",
            "MULTI_PART_SHORT_ANSWER": "SHORT_ANSWER",
            "LONG_DESCRIPTIVE": "DESCRIPTIVE",
        }

        for class_num in classes_to_process:
            query = {
                "provenance.class": class_num,
                "audit_status": "error",
                "error_category": "unsupported_type",
            }
            unsupported_questions = list(db.questions.find(query))
            logger.info(
                f"Class {class_num}: {len(unsupported_questions)} unsupported type questions"
            )

            for q in unsupported_questions:
                q_type = q.get("type", "")
                new_type = type_mapping.get(q_type)

                if new_type and not args.dry_run:
                    db.questions.update_one(
                        {"_id": q["_id"]},
                        {
                            "$set": {
                                "type": new_type,
                                "audit_status": "fixed",
                                "audit_result": [f"Converted {q_type} to {new_type}"],
                                "audit_timestamp": datetime.utcnow().isoformat(),
                            }
                        },
                    )
                    total_stats["fixed"] += 1
                    logger.info(f"Converted {q_type} -> {new_type}")
                elif new_type:
                    total_stats["skipped"] += 1

        logger.info("=== Unsupported Type Fix Complete ===")
        logger.info(f"Fixed: {total_stats['fixed']}")
        return 0

    # Handle placeholder_answer fix mode - generate answers using LLM
    if args.fix_placeholder_answer:
        from openai import OpenAI

        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=api_key,
        )

        for class_num in classes_to_process:
            query = {
                "provenance.class": class_num,
                "audit_status": "error",
                "error_category": "placeholder_answer",
            }
            placeholder_questions = list(db.questions.find(query))
            logger.info(
                f"Class {class_num}: {len(placeholder_questions)} placeholder answer questions"
            )

            for i, q in enumerate(placeholder_questions):
                q_id = str(q["_id"])
                q_text = q.get("text", q.get("question_text", ""))
                q_type = q.get("type", "SHORT_ANSWER")
                q_explanation = q.get("explanation", "")

                # Generate answer using LLM
                prompt = f"""Given this question, provide the correct answer.
Do NOT output JSON. Output ONLY the answer text.

Question Type: {q_type}
Question: {q_text}
Explanation (if available): {q_explanation}

Answer:"""

                try:
                    response = client.chat.completions.create(
                        model=args.model,
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.1,
                        max_tokens=500,
                    )
                    answer_content = response.choices[0].message.content

                    # If primary model returns empty, retry with fallback
                    if not answer_content:
                        logger.warning(f"Empty response, retrying with fallback model")
                        response = client.chat.completions.create(
                            model=args.fallback_model,
                            messages=[{"role": "user", "content": prompt}],
                            temperature=0.1,
                            max_tokens=500,
                        )
                        answer_content = response.choices[0].message.content

                    if not answer_content:
                        logger.warning(f"Empty response for {q_id}, skipping")
                        total_stats["errors"] += 1
                        continue
                    answer = answer_content.strip()

                    # Update question with generated answer
                    if not args.dry_run:
                        db.questions.update_one(
                            {"_id": q["_id"]},
                            {
                                "$set": {
                                    "correctAnswer": answer,
                                    "audit_status": "fixed",
                                    "audit_result": [
                                        "Answer generated by LLM for placeholder_answer"
                                    ],
                                    "audit_timestamp": datetime.utcnow().isoformat(),
                                }
                            },
                        )
                        total_stats["fixed"] += 1
                    else:
                        total_stats["skipped"] += 1

                    logger.info(
                        f"[{i + 1}/{len(placeholder_questions)}] {q_id}: Generated answer"
                    )

                except Exception as e:
                    logger.error(f"Error generating answer for {q_id}: {e}")
                    total_stats["errors"] += 1

                time.sleep(0.3)

                if (i + 1) % 20 == 0:
                    logger.info(
                        f"Progress: {i + 1}/{len(placeholder_questions)} for Class {class_num}"
                    )

        logger.info("=== Placeholder Answer Fix Complete ===")
        logger.info(f"Fixed: {total_stats['fixed']}, Errors: {total_stats['errors']}")
        return 0

    # Handle corrupted_control_chars fix mode
    if args.fix_corrupted_chars:
        from openai import OpenAI

        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=api_key,
        )

        import unicodedata

        def strip_control_chars(text: str) -> str:
            """Strip non-printable control chars but keep whitespace."""
            if not text:
                return text
            result = []
            for c in text:
                ord_c = ord(c)
                # Keep whitespace chars (\t, \n, \r) and printable chars
                if c in "\t\n\r" or (ord_c >= 32 and ord_c < 127):
                    result.append(c)
                elif ord_c >= 128:
                    # Keep extended ASCII chars (they're typically valid)
                    result.append(c)
            return "".join(result)

        for class_num in classes_to_process:
            query = {
                "provenance.class": class_num,
                "audit_status": "error",
                "error_category": "corrupted_control_chars",
            }
            corrupted_questions = list(db.questions.find(query))
            logger.info(
                f"Class {class_num}: {len(corrupted_questions)} corrupted control chars questions"
            )

            for i, q in enumerate(corrupted_questions):
                q_id = str(q["_id"])
                q_text = q.get("text", "")
                q_answer = q.get("correctAnswer", "")
                q_explanation = q.get("explanation", "")
                q_type = q.get("type", "SHORT_ANSWER")

                cleaned_answer = strip_control_chars(str(q_answer))
                cleaned_explanation = strip_control_chars(str(q_explanation))

                # Re-validate: check if question still makes sense after cleaning
                prompt = f"""This question was flagged because it contained corrupted control characters.
The characters have been stripped. Please verify the question still makes sense.

Question Type: {q_type}
Question Text: {q_text}
Answer (cleaned): {cleaned_answer}
Explanation (cleaned): {cleaned_explanation}

Does the question still make sense and have a valid answer? Answer YES or NO.
If NO, provide the correct answer that should replace the cleaned answer.
Respond with ONLY: YES or NO|answer"""

                try:
                    response = client.chat.completions.create(
                        model=args.model,
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.1,
                        max_tokens=100,
                    )
                    llm_content = response.choices[0].message.content

                    # If primary model returns empty, retry with fallback
                    if not llm_content:
                        logger.warning(f"Empty response, retrying with fallback model")
                        response = client.chat.completions.create(
                            model=args.fallback_model,
                            messages=[{"role": "user", "content": prompt}],
                            temperature=0.1,
                            max_tokens=100,
                        )
                        llm_content = response.choices[0].message.content

                    if not llm_content:
                        logger.warning(f"Empty response for {q_id}, skipping")
                        total_stats["errors"] += 1
                        continue
                    llm_response = llm_content.strip()

                    if llm_response.upper().startswith("YES"):
                        # Question still makes sense - apply cleaned fields
                        updates = {"audit_status": "fixed"}
                        if q_answer != cleaned_answer:
                            updates["correctAnswer"] = cleaned_answer
                            updates["audit_result"] = [
                                "Stripped control chars from answer"
                            ]
                        if q_explanation != cleaned_explanation:
                            updates["explanation"] = cleaned_explanation
                            updates.setdefault("audit_result", []).append(
                                "Stripped control chars from explanation"
                            )
                        updates["audit_timestamp"] = datetime.utcnow().isoformat()

                        if not args.dry_run:
                            db.questions.update_one(
                                {"_id": q["_id"]}, {"$set": updates}
                            )
                            total_stats["fixed"] += 1
                        else:
                            total_stats["skipped"] += 1

                        logger.info(
                            f"[{i + 1}/{len(corrupted_questions)}] {q_id}: Cleaned OK"
                        )
                    else:
                        # LLM says it's invalid - regenerate answer
                        new_answer = (
                            llm_response.split("|", 1)[-1].strip()
                            if "|" in llm_response
                            else cleaned_answer
                        )

                        if not args.dry_run:
                            db.questions.update_one(
                                {"_id": q["_id"]},
                                {
                                    "$set": {
                                        "correctAnswer": new_answer,
                                        "explanation": cleaned_explanation,
                                        "audit_status": "fixed",
                                        "audit_result": [
                                            "Stripped control chars, regenerated answer"
                                        ],
                                        "audit_timestamp": datetime.utcnow().isoformat(),
                                    }
                                },
                            )
                            total_stats["fixed"] += 1
                        else:
                            total_stats["skipped"] += 1

                        logger.info(
                            f"[{i + 1}/{len(corrupted_questions)}] {q_id}: Regenerated"
                        )

                except Exception as e:
                    logger.error(f"Error fixing {q_id}: {e}")
                    total_stats["errors"] += 1

                time.sleep(0.3)

                if (i + 1) % 20 == 0:
                    logger.info(
                        f"Progress: {i + 1}/{len(corrupted_questions)} for Class {class_num}"
                    )

        logger.info("=== Corrupted Chars Fix Complete ===")
        logger.info(f"Fixed: {total_stats['fixed']}, Errors: {total_stats['errors']}")
        return 0

    for class_num in classes_to_process:
        logger.info(f"=== Starting audit for Class {class_num} ===")

        stats = audit_class(
            db,
            agent,
            class_num,
            args.batch_size,
            args.dry_run,
            results_file=args.results_file,
            processed_ids=processed_ids,
        )

        for key in total_stats:
            total_stats[key] += stats[key]

        logger.info(f"=== Class {class_num} Summary ===")
        logger.info(
            f"Processed: {stats['processed']}, Fixed: {stats['fixed']}, OK: {stats['skipped']}, Errors: {stats['errors']}"
        )

    logger.info("=== FINAL SUMMARY ===")
    logger.info(f"Total Processed: {total_stats['processed']}")
    logger.info(f"Total Fixed: {total_stats['fixed']}")
    logger.info(f"Total OK: {total_stats['skipped']}")
    logger.info(f"Total Errors: {total_stats['errors']}")
    if args.dry_run:
        logger.info("(dry-run - no changes made)")

    return 0


if __name__ == "__main__":
    sys.exit(main())

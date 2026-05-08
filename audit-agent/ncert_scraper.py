"""Web search-based question verification using Camoufox + OpenRouter."""
import asyncio
import json
import re
import urllib.parse
from typing import List
from bs4 import BeautifulSoup
from camoufox.async_api import AsyncCamoufox
from config import LLM_PROVIDER, LLM_API_KEY, LLM_TEMPERATURE, OPENROUTER_BASE_URL, NCERT_REQUEST_DELAY


class VerificationResult:
    def __init__(self, found, question_text, answer, explanation, confidence, reasoning, sources):
        self.found = found
        self.question_text = question_text
        self.answer = answer
        self.explanation = explanation
        self.confidence = confidence
        self.reasoning = reasoning
        self.sources = sources


class WebVerifier:
    def __init__(self):
        self.browser = None
        self.context = None

    async def __aenter__(self):
        self.browser = await AsyncCamoufox(headless=True).__aenter__()
        self.context = await self.browser.new_context()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.__aexit__(exc_type, exc_val, exc_tb)

    def _html_to_text(self, html: str) -> str:
        soup = BeautifulSoup(html, 'html.parser')
        for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
            tag.decompose()
        text = soup.get_text(separator='\n')
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        return '\n'.join(lines)

    async def search_duckduckgo(self, query: str, num_results: int = 3) -> List[str]:
        page = await self.context.new_page()
        try:
            search_url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
            await page.goto(search_url, wait_until='networkidle', timeout=30000)
            html = await page.content()
            links = re.findall(r'//duckduckgo\.com/l/\?uddg=([^&\s"<>]+)', html)
            urls = []
            for link in links[:num_results]:
                try:
                    decoded = urllib.parse.unquote(link)
                    if decoded not in urls:
                        urls.append(decoded)
                except Exception:
                    continue
            return urls
        finally:
            await page.close()

    async def fetch_page_content(self, url: str) -> str:
        page = await self.context.new_page()
        try:
            await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            await asyncio.sleep(2)
            html = await page.content()
            return self._html_to_text(html)
        except Exception as e:
            print(f"Fetch error {url}: {e}")
            return ""
        finally:
            await page.close()

    async def _call_llm(self, messages: List[dict]) -> str:
        import requests
        headers = {
            "Authorization": f"Bearer {LLM_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": LLM_PROVIDER,
            "messages": messages,
            "temperature": LLM_TEMPERATURE,
            "max_tokens": 2000,
        }
        resp = requests.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=120,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

    async def verify_question(
        self,
        question_text: str,
        correct_answer: str,
        question_type: str,
    ) -> VerificationResult:
        search_query = f"{question_text[:120]} answer"
        urls = await self.search_duckduckgo(search_query, num_results=3)

        if not urls:
            return VerificationResult(
                found=False,
                question_text=question_text,
                answer="",
                explanation="No search results found",
                confidence=0.0,
                reasoning="DuckDuckGo search returned no results",
                sources=[],
            )

        contents = []
        for url in urls:
            text = await self.fetch_page_content(url)
            if text:
                contents.append(f"SOURCE: {url}\n{text[:5000]}")

        if not contents:
            return VerificationResult(
                found=False,
                question_text=question_text,
                answer="",
                explanation="Could not fetch any search results",
                confidence=0.0,
                reasoning="All source pages failed to load",
                sources=urls,
            )

        combined_content = "\n\n---\n\n".join(contents)

        system_msg = "You verify questions against web sources. Return ONLY valid JSON."
        user_msg = f"""Verify this question against web sources.

QUESTION: "{question_text}"
CANDIDATE ANSWER: "{correct_answer}"
QUESTION TYPE: {question_type}

SOURCES:
{combined_content[:12000]}

Return JSON with these fields:
- found (bool): was the question concept found in sources
- answer (str): the correct answer according to sources
- explanation (str): brief explanation
- confidence (float): 0.0 to 1.0
- reasoning (str): why you believe this

Focus on whether the QUESTION CONCEPT and ANSWER are correct, not exact text matching."""

        try:
            llm_response = await self._call_llm([
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg},
            ])

            json_match = re.search(r'\{.*\}', llm_response, re.DOTALL)
            if not json_match:
                raise ValueError("No JSON found in LLM response")

            data = json.loads(json_match.group())
            if "sources" not in data or not data.get("sources"):
                data["sources"] = urls

            return VerificationResult(
                found=data.get("found", False),
                question_text=question_text,
                answer=data.get("answer", ""),
                explanation=data.get("explanation", ""),
                confidence=float(data.get("confidence", 0.0)),
                reasoning=data.get("reasoning", ""),
                sources=data.get("sources", urls),
            )
        except Exception as e:
            return VerificationResult(
                found=False,
                question_text=question_text,
                answer="",
                explanation="LLM verification failed",
                confidence=0.0,
                reasoning=f"LLM error: {str(e)}",
                sources=urls,
            )

    async def verify_with_delay(
        self,
        question_text: str,
        correct_answer: str,
        question_type: str,
    ) -> VerificationResult:
        await asyncio.sleep(NCERT_REQUEST_DELAY)
        return await self.verify_question(question_text, correct_answer, question_type)

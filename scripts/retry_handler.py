# scripts/retry_handler.py
import asyncio
import logging
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)
from typing import Type

logger = logging.getLogger(__name__)


class ResilientCrawler:
    """Wrapper with exponential backoff for network operations."""

    def __init__(self, max_attempts: int = 3):
        self.max_attempts = max_attempts

    def retryable(self, exceptions: tuple = (Exception,)):
        """Decorator for retryable operations."""

        def decorator(func):
            @retry(
                stop=stop_after_attempt(self.max_attempts),
                wait=wait_exponential(multiplier=1, min=2, max=10),
                retry=retry_if_exception_type(exceptions),
                before_sleep=lambda retry_state: logger.warning(
                    f"Retry {retry_state.attempt_number} for {retry_state.fn.__name__} after {retry_state.outcome.exception()}"
                ),
            )
            async def wrapper(*args, **kwargs):
                return await func(*args, **kwargs)

            # Preserve function signature
            wrapper.__name__ = func.__name__
            wrapper.__doc__ = func.__doc__
            return wrapper

        return decorator

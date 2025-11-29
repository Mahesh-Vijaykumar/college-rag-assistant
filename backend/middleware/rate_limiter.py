"""Rate limiting middleware for protecting against brute force attacks."""
import time
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """
    IP-based rate limiter with exponential backoff and account lockout.
    """
    def __init__(
        self,
        max_attempts: int = 5,
        window_seconds: int = 300,  # 5 minutes
        lockout_duration: int = 900  # 15 minutes
    ):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.lockout_duration = lockout_duration
        
        # Track attempts: {ip: [(timestamp, success), ...]}
        self.attempts: Dict[str, list] = defaultdict(list)
        
        # Track lockouts: {ip: lockout_until_timestamp}
        self.lockouts: Dict[str, float] = {}
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _cleanup_old_attempts(self, ip: str):
        """Remove attempts outside the current window."""
        current_time = time.time()
        cutoff_time = current_time - self.window_seconds
        
        if ip in self.attempts:
            self.attempts[ip] = [
                (ts, success) for ts, success in self.attempts[ip]
                if ts > cutoff_time
            ]
    
    def is_locked_out(self, ip: str) -> Tuple[bool, int]:
        """
        Check if IP is locked out.
        Returns: (is_locked, seconds_remaining)
        """
        if ip in self.lockouts:
            current_time = time.time()
            if current_time < self.lockouts[ip]:
                remaining = int(self.lockouts[ip] - current_time)
                return True, remaining
            else:
                # Lockout expired
                del self.lockouts[ip]
                self.attempts[ip] = []  # Clear attempts after lockout
        
        return False, 0
    
    def check_rate_limit(self, request: Request) -> None:
        """
        Check if request should be rate limited.
        Raises HTTPException if limit exceeded.
        """
        ip = self._get_client_ip(request)
        
        # Check if locked out
        is_locked, remaining = self.is_locked_out(ip)
        if is_locked:
            logger.warning(f"Rate limit: IP {ip} is locked out for {remaining}s")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Account temporarily locked",
                    "message": f"Too many failed attempts. Please try again in {remaining} seconds.",
                    "retry_after": remaining
                }
            )
        
        # Cleanup old attempts
        self._cleanup_old_attempts(ip)
        
        # Count failed attempts in current window
        failed_attempts = sum(
            1 for _, success in self.attempts[ip]
            if not success
        )
        
        if failed_attempts >= self.max_attempts:
            # Lock out the IP
            lockout_until = time.time() + self.lockout_duration
            self.lockouts[ip] = lockout_until
            
            logger.warning(
                f"Rate limit: IP {ip} locked out for {self.lockout_duration}s "
                f"after {failed_attempts} failed attempts"
            )
            
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Account temporarily locked",
                    "message": f"Too many failed attempts. Account locked for {self.lockout_duration // 60} minutes.",
                    "retry_after": self.lockout_duration
                }
            )
    
    def record_attempt(self, request: Request, success: bool):
        """Record a login attempt."""
        ip = self._get_client_ip(request)
        current_time = time.time()
        
        self.attempts[ip].append((current_time, success))
        
        # Log the attempt
        status_str = "successful" if success else "failed"
        logger.info(f"Login attempt from {ip}: {status_str}")
        
        # If successful, clear failed attempts
        if success and ip in self.attempts:
            self.attempts[ip] = [(current_time, True)]
            if ip in self.lockouts:
                del self.lockouts[ip]

# Global rate limiter instance
login_rate_limiter = RateLimiter(
    max_attempts=5,
    window_seconds=300,  # 5 minutes
    lockout_duration=60  # 1 minute
)

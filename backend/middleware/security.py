"""Security middleware for HTTP security headers and logging."""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adds security headers to all HTTP responses.
    """
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs all requests for security monitoring.
    """
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        forwarded = request.headers.get("X-Forwarded-For")
        client_ip = forwarded.split(",")[0].strip() if forwarded else (
            request.client.host if request.client else "unknown"
        )
        
        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path} from {client_ip}"
        )
        
        # Process request
        start_time = datetime.now()
        response = await call_next(request)
        duration = (datetime.now() - start_time).total_seconds()
        
        # Log response
        logger.info(
            f"Response: {response.status_code} for {request.method} {request.url.path} "
            f"({duration:.3f}s)"
        )
        
        return response

def log_security_event(event_type: str, username: str = None, ip_address: str = "unknown", details: str = None):
    """
    Log security-related events.
    """
    timestamp = datetime.utcnow().isoformat()
    log_message = f"SECURITY EVENT [{event_type}] - Time: {timestamp}, IP: {ip_address}"
    
    if username:
        log_message += f", User: {username}"
    if details:
        log_message += f", Details: {details}"
    
    logger.warning(log_message)

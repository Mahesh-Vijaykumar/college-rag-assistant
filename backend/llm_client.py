import httpx
import asyncio
import requests
from requests.exceptions import Timeout, RequestException
from typing import Optional
from config import settings


def _generate_local_sync(prompt: str) -> str:
    """
    Synchronous helper for local LLM calls (Ollama).
    Runs in a threadpool to avoid blocking the async event loop.
    
    Args:
        prompt: The formatted prompt to send to the LLM
        
    Returns:
        Generated text response
        
    Raises:
        Timeout: If the request times out
        RequestException: If there's a connection or HTTP error
    """
    payload = {
        "model": settings.LLM_MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }
    
    try:
        response = requests.post(settings.LLM_API_URL, json=payload, timeout=60)
        response.raise_for_status()
        return response.json().get("response", "Error generating response.")
    except Timeout:
        return "Local LLM request timed out. Please ensure the LLM is running and responsive."
    except RequestException as e:
        print(f"Local LLM Error: {e}")
        return "I encountered an error while trying to generate an answer. Please ensure the local LLM is running."
    except Exception as e:
        print(f"Unexpected error in local LLM: {e}")
        return "An unexpected error occurred while generating the answer."


async def generate_local(prompt: str) -> str:
    """
    Generate answer using local LLM (Ollama).
    
    Runs the synchronous HTTP call in a threadpool to prevent blocking
    the async event loop, allowing other requests to be processed concurrently.
    
    Args:
        prompt: The formatted prompt to send to the LLM
        
    Returns:
        Generated text response
    """
    # Run blocking requests.post in threadpool to avoid blocking event loop
    return await asyncio.to_thread(_generate_local_sync, prompt)


async def generate_gemini(prompt: str) -> str:
    """
    Generate answer using Gemini API with retry logic and exponential backoff.
    
    Args:
        prompt: The formatted prompt to send to Gemini
        
    Returns:
        Generated text response
    """
    if not settings.GEMINI_API_KEY:
        return "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file."
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    
    max_retries = 2
    base_delay = 1.0  # Start with 1 second delay
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for attempt in range(max_retries + 1):
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                
                data = response.json()
                
                # Extract text from Gemini response structure
                if "candidates" in data and len(data["candidates"]) > 0:
                    candidate = data["candidates"][0]
                    if "content" in candidate and "parts" in candidate["content"]:
                        parts = candidate["content"]["parts"]
                        if len(parts) > 0 and "text" in parts[0]:
                            return parts[0]["text"]
                
                # If we can't parse the expected structure, return error
                print(f"Unexpected Gemini response structure: {data}")
                return "Error: Unexpected response format from Gemini API."
                
            except httpx.TimeoutException:
                if attempt < max_retries:
                    delay = base_delay * (2 ** attempt)  # Exponential backoff
                    print(f"Gemini request timed out. Retrying in {delay}s... (Attempt {attempt + 1}/{max_retries})")
                    await asyncio.sleep(delay)
                else:
                    return "Gemini API request timed out after multiple retries. Please try again later."
                    
            except httpx.HTTPStatusError as e:
                if attempt < max_retries and e.response.status_code >= 500:
                    # Retry on server errors (5xx)
                    delay = base_delay * (2 ** attempt)
                    print(f"Gemini server error ({e.response.status_code}). Retrying in {delay}s... (Attempt {attempt + 1}/{max_retries})")
                    await asyncio.sleep(delay)
                else:
                    # Don't retry on client errors (4xx) or after max retries
                    error_msg = f"Gemini API error: {e.response.status_code}"
                    if e.response.status_code == 400:
                        error_msg += " - Invalid request. Please check your prompt."
                    elif e.response.status_code == 401:
                        error_msg += " - Invalid API key. Please check your GEMINI_API_KEY."
                    elif e.response.status_code == 429:
                        error_msg += " - Rate limit exceeded. Please try again later."
                    print(error_msg)
                    return f"Error: {error_msg}"
                    
            except httpx.RequestError as e:
                if attempt < max_retries:
                    delay = base_delay * (2 ** attempt)
                    print(f"Gemini request error: {e}. Retrying in {delay}s... (Attempt {attempt + 1}/{max_retries})")
                    await asyncio.sleep(delay)
                else:
                    print(f"Gemini request failed after {max_retries} retries: {e}")
                    return "Error: Unable to connect to Gemini API. Please check your internet connection."
                    
            except Exception as e:
                print(f"Unexpected error in Gemini API call: {e}")
                return f"An unexpected error occurred: {str(e)}"
    
    return "Error: Failed to generate response from Gemini API."


async def generate_answer_llm(prompt: str) -> str:
    """
    Unified LLM interface that switches between local and Gemini based on configuration.
    
    Args:
        prompt: The formatted prompt to send to the LLM
        
    Returns:
        Generated text response
    """
    provider = settings.LLM_PROVIDER.lower()
    
    if provider == "gemini":
        return await generate_gemini(prompt)
    elif provider == "local":
        return await generate_local(prompt)
    else:
        print(f"Warning: Unknown LLM_PROVIDER '{settings.LLM_PROVIDER}'. Falling back to local.")
        return await generate_local(prompt)

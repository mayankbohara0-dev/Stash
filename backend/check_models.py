import httpx
import asyncio
import os

async def check():
    # Key is loaded from environment — never hardcode secrets
    key = os.environ.get("GEMINI_API_KEY", "")
    if not key:
        print("Set GEMINI_API_KEY environment variable first")
        return
    async with httpx.AsyncClient() as client:
        r = await client.get(f'https://generativelanguage.googleapis.com/v1beta/models?key={key}')
        print(r.status_code)
        print(r.text[:3000])

asyncio.run(check())

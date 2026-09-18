import httpx
import asyncio
import json
import os

async def test_chat():
    # Key is loaded from .env / environment — never hardcode secrets
    key = os.environ.get("GEMINI_API_KEY", "")
    if not key:
        print("Set GEMINI_API_KEY environment variable first (or load from .env)")
        return

    model = "gemini-2.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    
    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": "Where did most of my money go this month?"}]}
        ],
        "system_instruction": {
            "parts": [{"text": "You are Stash AI, a personal finance assistant.\n\n=== USER'S FINANCIAL DATA ===\nUser: Mayank\nCurrency: INR\n\nCurrent Month: September 2026\n\n--- MONTHLY SUMMARY ---\nMonthly Income: \u20b975,000\nMonthly Expenses: \u20b932,000\nMonthly Savings: \u20b943,000\nSavings Rate: 57.3%\nTotal Balance: \u20b91,23,000\n\n--- SPENDING BY CATEGORY ---\nFood & Dining: \u20b912,000 (37%)\nTransport: \u20b96,000 (19%)\nShopping: \u20b95,000 (16%)\nUtilities: \u20b94,500 (14%)\nEntertainment: \u20b93,500 (11%)\n\n=== END FINANCIAL DATA ==="}]
        },
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 500,
        },
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload)
        print(f"Status: {resp.status_code}")
        data = resp.json()
        if resp.status_code == 200:
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                for p in parts:
                    if "text" in p:
                        print("\nAI Response:")
                        print(p["text"])
        else:
            print(json.dumps(data, indent=2))

asyncio.run(test_chat())

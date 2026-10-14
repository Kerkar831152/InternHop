import os

import requests
from dotenv import load_dotenv


load_dotenv()

SERPAPI_URL = "https://serpapi.com/search.json"


def search_google(query, num_results=10):
    api_key = os.getenv("SERPAPI_API_KEY")

    if not api_key:
        raise ValueError("SERPAPI_API_KEY is not configured.")

    params = {
        "engine": "google",
        "q": query,
        "api_key": api_key,
        "num": num_results,
    }

    try:
        response = requests.get(
            SERPAPI_URL,
            params=params,
            timeout=30,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(f"SerpApi request failed: {exc}") from exc

    data = response.json()

    if "error" in data:
        raise RuntimeError(f"SerpApi error: {data['error']}")

    return data.get("organic_results", [])

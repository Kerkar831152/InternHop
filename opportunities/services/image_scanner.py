
import json
import os
import time

from google import genai
from google.genai import types


def scan_opportunity_image(image_bytes, mime_type):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    client = genai.Client(api_key=api_key)

    prompt = """
    Analyze this image. It may contain an internship or hackathon
    announcement, poster, screenshot, or listing.

    Extract only information that is actually visible or clearly stated.
    Never invent missing details. Use null for unavailable values.

    Return valid JSON with exactly these fields:

    {
        "opportunity_type": "internship" or "hackathon" or "unknown",
        "title": null,
        "organisation": null,
        "location": null,
        "country": null,
        "description": null,
        "eligibility": null,
        "skills": null,
        "stipend": null,
        "internship_type": null,
        "themes": null,
        "event_type": null,
        "participation_mode": null,
        "deadline": null,
        "registration_deadline": null,
        "start_date": null,
        "end_date": null,
        "application_url": null,
        "qr_code_content": null,
        "missing_fields": [],
        "notes": null
    }

    If a QR code is visible, attempt to read its contents.
    Do not invent or guess a URL if it cannot be read.

    Dates must use YYYY-MM-DD. If the year is unclear, return null.
    Do not classify an image as legitimate or verified merely because
    it looks professional.
    """

    response = None

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
                contents=[
                    prompt,
                    types.Part.from_bytes(
                        data=image_bytes,
                        mime_type=mime_type,
                    ),
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )
            break

        except Exception:
            if attempt == 2:
                raise

            time.sleep(3)

    if not response or not response.text:
        raise ValueError("Gemini returned an empty response.")

    try:
        return json.loads(response.text)
    except json.JSONDecodeError as exc:
        raise ValueError("Gemini returned invalid structured data.") from exc

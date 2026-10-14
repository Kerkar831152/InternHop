from urllib.parse import urldefrag, urlparse

from .serpapi import search_google


INTERNSHIP_QUERIES = [
    "software engineering internships India",
    "computer science internships students India",
]

HACKATHON_QUERIES = [
    "upcoming hackathons India students",
    "online hackathons accepting registrations",
]


def normalize_url(url):
    if not url:
        return ""

    url = urldefrag(url.strip())[0]
    return url.rstrip("/")


def discover_results(queries, num_results=5):
    discovered = []
    seen_urls = set()

    for query in queries:
        results = search_google(query, num_results=num_results)

        for result in results:
            url = normalize_url(result.get("link"))

            if not url:
                continue

            parsed_url = urlparse(url)

            if parsed_url.scheme not in ("http", "https"):
                continue

            if url in seen_urls:
                continue

            seen_urls.add(url)

            discovered.append({
                "title": result.get("title", ""),
                "source_url": url,
                "description": result.get("snippet", ""),
                "source": result.get("source", ""),
                "query": query,
            })

    return discovered


def discover_internships(num_results=5):
    return discover_results(
        INTERNSHIP_QUERIES,
        num_results=num_results,
    )


def discover_hackathons(num_results=5):
    return discover_results(
        HACKATHON_QUERIES,
        num_results=num_results,
    )
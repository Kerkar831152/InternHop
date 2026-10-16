import json
import re
from datetime import date, datetime
from html import unescape
from urllib.parse import (
    parse_qsl,
    urlencode,
    urldefrag,
    urljoin,
    urlsplit,
    urlunsplit,
)

import requests
from bs4 import BeautifulSoup

from .serpapi import search_google


INTERNSHIP_QUERIES = [
    "software engineering internship India students",
    "computer science internship applications open",
]

HACKATHON_QUERIES = [
    "upcoming hackathons India students registration",
    "online hackathons accepting registrations",
]

GENERIC_URL_PATTERNS = [
    r"(^|\.)foundit\.in/search/",
    r"(^|\.)internshala\.com/internships/?$",
    r"(^|\.)linkedin\.com/jobs/(search|collections)(/|$)",
    r"(^|\.)indeed\.[^/]+/q-",
    r"(^|\.)glassdoor\.[^/]+/Job/",
    r"(^|\.)reddit\.com/",
    r"(^|\.)facebook\.com/",
    r"(^|\.)youtube\.com/",
]

GENERIC_TITLE_PHRASES = [
    "career advice",
    "student guide",
    "how to find internships",
    "how to get an internship",
    "top hackathons",
    "best hackathons",
    "list of hackathons",
    "best websites for internships",
    "internship tips",
]

CLOSED_TITLE_PHRASES = [
    "registration closed",
    "applications closed",
    "applications are closed",
    "registration has ended",
    "event has ended",
    "deadline passed",
]

TRACKING_PARAMETERS = {
    "fbclid",
    "gclid",
    "dclid",
    "msclkid",
    "mc_cid",
    "mc_eid",
    "ref_src",
    "ref_url",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    )
}

REQUEST_TIMEOUT = (5, 15)
MAX_PAGE_BYTES = 2_000_000


def safe_text(value):
    if value is None:
        return ""

    if isinstance(value, (str, int, float)):
        return re.sub(r"\s+", " ", unescape(str(value))).strip()

    return ""


def as_list(value):
    if not value:
        return []

    if isinstance(value, str):
        values = re.split(r"[,;\n]+", value)
    elif isinstance(value, (list, tuple, set)):
        values = list(value)
    else:
        return []

    return [text for item in values if (text := safe_text(item))]


def clean_query_value(value):
    value = safe_text(value)
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s.+#/-]", " ", value)).strip()


def unique_strings(values):
    output = []
    seen = set()

    for value in values:
        value = clean_query_value(value)
        key = value.casefold()

        if value and key not in seen:
            seen.add(key)
            output.append(value)

    return output


def get_profile_values(profile, *keys):
    if not isinstance(profile, dict):
        return []

    for key in keys:
        values = as_list(profile.get(key))
        if values:
            return values

    return []


def build_internship_queries(profile=None):
    queries = list(INTERNSHIP_QUERIES)

    skills = get_profile_values(profile, "skills")
    roles = get_profile_values(profile, "preferred_roles", "roles", "interests")
    locations = get_profile_values(profile, "locations", "location", "preferred_location")
    course = get_profile_values(profile, "course", "degree", "field_of_study")
    year = get_profile_values(profile, "year_of_study", "study_year", "year")

    if roles:
        queries.append(f"{roles[0]} internship applications open")

    if skills:
        queries.append(f"{' '.join(skills[:3])} internship students")

    if locations:
        queries.append(f"internship {' '.join(locations[:2])} students")

    if course and year:
        queries.append(f"{course[0]} year {year[0]} internship")

    return unique_strings(queries)[:6]


def build_hackathon_queries(profile=None):
    queries = list(HACKATHON_QUERIES)

    skills = get_profile_values(profile, "skills")
    interests = get_profile_values(
        profile, "preferred_roles", "interests", "fields_of_interest"
    )
    locations = get_profile_values(profile, "locations", "location", "preferred_location")

    if skills:
        queries.append(f"{' '.join(skills[:3])} hackathon registration")

    if interests:
        queries.append(f"{interests[0]} hackathon students")

    if locations:
        queries.append(f"hackathon {' '.join(locations[:2])} students")

    return unique_strings(queries)[:6]


def normalize_url(url):
    url = safe_text(url)

    if not url:
        return ""

    try:
        url = urldefrag(url)[0]
        parsed = urlsplit(url)

        scheme = parsed.scheme.lower()
        hostname = parsed.hostname

        if scheme not in ("http", "https") or not hostname:
            return ""

        if parsed.username is not None or parsed.password is not None:
            return ""

        hostname = hostname.lower()

        try:
            port = parsed.port
        except ValueError:
            return ""

        if (scheme == "https" and port == 443) or (
            scheme == "http" and port == 80
        ):
            port = None

        netloc = hostname if port is None else f"{hostname}:{port}"
        path = parsed.path.rstrip("/") or "/"

        query_items = [
            (key, value)
            for key, value in parse_qsl(parsed.query, keep_blank_values=True)
            if key.casefold() not in TRACKING_PARAMETERS
            and not key.casefold().startswith("utm_")
        ]

        return urlunsplit(
            (scheme, netloc, path, urlencode(query_items, doseq=True), "")
        )

    except (TypeError, ValueError):
        return ""


def is_valid_http_url(url):
    try:
        parsed = urlsplit(url)
        hostname = parsed.hostname or ""

        return (
            parsed.scheme.lower() in ("http", "https")
            and bool(hostname)
            and "." in hostname
            and not any(char.isspace() for char in parsed.netloc)
            and parsed.username is None
            and parsed.password is None
        )
    except (TypeError, ValueError):
        return False


def has_old_year_without_current_context(result):
    text = f"{safe_text(result.get('title'))} {safe_text(result.get('snippet'))}"
    years = [int(year) for year in re.findall(r"\b20\d{2}\b", text)]

    if not years:
        return False

    current_year = date.today().year

    return (
        not any(year >= current_year for year in years)
        and max(years) < current_year - 1
    )


def mentions_closed_registration(result):
    text = (
        f"{safe_text(result.get('title'))} "
        f"{safe_text(result.get('snippet'))}"
    ).casefold()

    return any(phrase in text for phrase in CLOSED_TITLE_PHRASES)


def is_likely_generic_page(result):
    title = safe_text(result.get("title")).casefold()
    url = safe_text(result.get("link")).casefold()

    try:
        parsed = urlsplit(url)
        hostname = parsed.hostname or ""
        path = parsed.path
    except ValueError:
        return True

    if any(
        re.search(pattern, hostname + path, re.I)
        for pattern in GENERIC_URL_PATTERNS
    ):
        return True

    if any(phrase in title for phrase in GENERIC_TITLE_PHRASES):
        return True

    return has_old_year_without_current_context(result)


def contains_phrase(text, phrase):
    phrase = safe_text(phrase)

    if not phrase:
        return False

    pattern = r"(?<!\w)" + re.escape(phrase).replace(r"\ ", r"\s+") + r"(?!\w)"
    return re.search(pattern, text, re.IGNORECASE) is not None


def score_relevance(result, profile=None):
    if not isinstance(profile, dict) or not profile:
        return 0, []

    title = safe_text(result.get("title")).casefold()
    snippet = safe_text(result.get("snippet")).casefold()
    text = f"{title} {snippet}"

    skills = get_profile_values(profile, "skills")
    roles = get_profile_values(
        profile, "preferred_roles", "roles", "interests", "fields_of_interest"
    )
    locations = get_profile_values(
        profile, "locations", "location", "preferred_location"
    )
    course = get_profile_values(profile, "course", "degree", "field_of_study")
    year = get_profile_values(profile, "year_of_study", "study_year", "year")

    score = 0
    matched = []

    for skill in skills:
        if contains_phrase(title, skill):
            score += 3
            matched.append(skill)
        elif contains_phrase(snippet, skill):
            score += 1
            matched.append(skill)

    for role in roles:
        if contains_phrase(title, role):
            score += 3
            matched.append(role)
        elif contains_phrase(snippet, role):
            score += 1
            matched.append(role)

    for location in locations:
        if contains_phrase(text, location):
            score += 2
            matched.append(location)

    for field in course:
        if contains_phrase(text, field):
            score += 2
            matched.append(field)

    for study_year in year:
        if contains_phrase(text, study_year):
            score += 1
            matched.append(study_year)

    return score, list(dict.fromkeys(matched))


def fetch_page(url):
    try:
        with requests.get(
            url,
            headers=HEADERS,
            timeout=REQUEST_TIMEOUT,
            stream=True,
            allow_redirects=True,
        ) as response:
            response.raise_for_status()

            content_type = response.headers.get("Content-Type", "").lower()
            if "html" not in content_type and "xhtml" not in content_type:
                return None, response.url

            chunks = []
            total = 0

            for chunk in response.iter_content(chunk_size=16384):
                if not chunk:
                    continue

                total += len(chunk)

                if total > MAX_PAGE_BYTES:
                    break

                chunks.append(chunk)

            content = b"".join(chunks)
            encoding = response.encoding or "utf-8"

            return content.decode(encoding, errors="replace"), response.url

    except (requests.RequestException, UnicodeError, ValueError):
        return None, url


def flatten_jsonld(value):
    if isinstance(value, list):
        for item in value:
            yield from flatten_jsonld(item)

    elif isinstance(value, dict):
        if "@graph" in value:
            yield from flatten_jsonld(value["@graph"])
        else:
            yield value


def get_jsonld_objects(soup):
    objects = []

    for script in soup.find_all("script", type="application/ld+json"):
        raw = script.string or script.get_text()

        try:
            parsed = json.loads(raw)
            objects.extend(flatten_jsonld(parsed))
        except (json.JSONDecodeError, TypeError, ValueError):
            continue

    return objects


def schema_types(obj):
    value = obj.get("@type", [])

    if isinstance(value, str):
        return [value.casefold()]

    if isinstance(value, list):
        return [safe_text(item).casefold() for item in value]

    return []


def first_value(*values):
    for value in values:
        if isinstance(value, dict):
            value = value.get("name") or value.get("value")

        if isinstance(value, list):
            value = ", ".join(safe_text(item) for item in value if safe_text(item))

        text = safe_text(value)

        if text:
            return text

    return ""


def extract_date(value):
    if isinstance(value, dict):
        value = value.get("startDate") or value.get("endDate") or value.get("value")

    value = safe_text(value)

    if not value:
        return None

    candidates = [
        value,
        value[:10],
    ]

    for candidate in candidates:
        try:
            return date.fromisoformat(candidate)
        except ValueError:
            pass

        try:
            return datetime.fromisoformat(
                candidate.replace("Z", "+00:00")
            ).date()
        except ValueError:
            pass

    match = re.search(r"\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b", value)

    if match:
        try:
            return date(
                int(match.group(1)),
                int(match.group(2)),
                int(match.group(3)),
            )
        except ValueError:
            pass

    return None


def extract_page_details(html, page_url, fallback_title="", fallback_description=""):
    soup = BeautifulSoup(html, "html.parser")
    objects = get_jsonld_objects(soup)

    title = ""
    description = ""
    company = ""
    organizer = ""
    location = ""
    stipend = ""
    skills = ""
    internship_type = ""
    themes = ""
    event_type = ""
    participation_mode = ""
    deadline = None
    registration_deadline = None
    start_date = None
    end_date = None

    for selector in (
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
    ):
        tag = soup.select_one(selector)
        if tag and tag.get("content"):
            title = safe_text(tag["content"])
            break

    if not title and soup.title:
        title = safe_text(soup.title.get_text(" ", strip=True))

    for selector in (
        'meta[name="description"]',
        'meta[property="og:description"]',
    ):
        tag = soup.select_one(selector)
        if tag and tag.get("content"):
            description = safe_text(tag["content"])
            break

    for obj in objects:
        types = schema_types(obj)

        if not title:
            title = first_value(obj.get("title"), obj.get("name"))

        if not description:
            description = first_value(obj.get("description"))

        if any("jobposting" in item for item in types):
            company = first_value(
                obj.get("hiringOrganization"),
                company,
            )
            location = first_value(
                obj.get("jobLocation"),
                location,
            )
            skills = first_value(
                obj.get("skills"),
                obj.get("qualifications"),
                skills,
            )
            internship_type = first_value(
                obj.get("employmentType"),
                internship_type,
            )

            base_salary = obj.get("baseSalary")

            if isinstance(base_salary, dict):
                value = base_salary.get("value", {})
                if isinstance(value, dict):
                    minimum = value.get("minValue")
                    maximum = value.get("maxValue")
                    currency = value.get("currency", "")
                    unit = value.get("unitText", "")

                    if minimum is not None and maximum is not None:
                        stipend = f"{minimum}-{maximum} {currency} {unit}".strip()
                    elif minimum is not None:
                        stipend = f"{minimum} {currency} {unit}".strip()
                    elif maximum is not None:
                        stipend = f"{maximum} {currency} {unit}".strip()

                elif value:
                    stipend = f"{value} {base_salary.get('currency', '')}".strip()

            deadline = extract_date(obj.get("validThrough")) or deadline

        if any(
            item in {"event", "hackathon", "festival"}
            for item in types
        ):
            organizer = first_value(obj.get("organizer"), organizer)
            location = first_value(obj.get("location"), location)
            start_date = extract_date(obj.get("startDate")) or start_date
            end_date = extract_date(obj.get("endDate")) or end_date
            event_type = first_value(obj.get("eventAttendanceMode"), event_type)

        if not company:
            company = first_value(obj.get("hiringOrganization"))

        if not organizer:
            organizer = first_value(obj.get("organizer"))

    text = safe_text(soup.get_text(" ", strip=True))

    if not title:
        title = safe_text(fallback_title)

    if not description:
        description = safe_text(fallback_description)

    if not company:
        for pattern in (
            r"(?:company|employer)\s*[:\-]\s*([^|.;]{2,120})",
            r"(?:offered by|at)\s+([A-Z][A-Za-z0-9& .'-]{2,100})",
        ):
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                company = safe_text(match.group(1))
                break

    if not location:
        match = re.search(
            r"(?:location|job location)\s*[:\-]\s*([^|.;]{2,100})",
            text,
            re.IGNORECASE,
        )
        if match:
            location = safe_text(match.group(1))

    if not stipend:
        match = re.search(
            r"(?:stipend|salary|compensation)\s*[:\-]\s*"
            r"((?:INR|Rs\.?|₹|\$)?\s*[\d,]+(?:\s*[-–to]+\s*[\d,]+)?"
            r"\s*(?:per month|/month|monthly|per annum|/year|annually)?)",
            text,
            re.IGNORECASE,
        )
        if match:
            stipend = safe_text(match.group(1))

    if not skills:
        match = re.search(
            r"(?:required skills|skills required|technologies)\s*[:\-]\s*"
            r"(.{2,300}?)(?:\.|responsibilities|qualifications|requirements|$)",
            text,
            re.IGNORECASE,
        )
        if match:
            skills = safe_text(match.group(1))

    if not internship_type:
        if re.search(r"\b(remote|work from home)\b", text, re.IGNORECASE):
            internship_type = "Remote"
        elif re.search(r"\bhybrid\b", text, re.IGNORECASE):
            internship_type = "Hybrid"
        elif re.search(r"\bon[- ]site\b", text, re.IGNORECASE):
            internship_type = "On-site"

    if not themes:
        match = re.search(
            r"(?:themes?|tracks?)\s*[:\-]\s*(.{2,250}?)(?:\.|deadline|registration|$)",
            text,
            re.IGNORECASE,
        )
        if match:
            themes = safe_text(match.group(1))

    if not event_type:
        if re.search(r"\b(hackathon|coding challenge)\b", title, re.IGNORECASE):
            event_type = "Hackathon"

    if not participation_mode:
        if re.search(r"\bonline\b|\bvirtual\b", text, re.IGNORECASE):
            participation_mode = "online"
        elif re.search(r"\bhybrid\b", text, re.IGNORECASE):
            participation_mode = "hybrid"
        elif re.search(r"\bin[- ]person\b|\bon[- ]site\b", text, re.IGNORECASE):
            participation_mode = "offline"

    if not registration_deadline:
        for pattern in (
            r"(?:registration deadline|register by|last date to register)\s*[:\-]?\s*"
            r"([A-Za-z]+\s+\d{1,2},?\s+20\d{2}|\d{4}-\d{2}-\d{2})",
            r"(?:registration closes|registration ends)\s*[:\-]?\s*"
            r"([A-Za-z]+\s+\d{1,2},?\s+20\d{2}|\d{4}-\d{2}-\d{2})",
        ):
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                registration_deadline = extract_date(match.group(1))
                if registration_deadline:
                    break

    if not deadline:
        deadline = registration_deadline

    return {
        "title": title,
        "company": company,
        "organizer": organizer,
        "location": location,
        "description": description,
        "skills": skills,
        "stipend": stipend,
        "internship_type": internship_type,
        "deadline": deadline,
        "themes": themes,
        "event_type": event_type,
        "participation_mode": participation_mode,
        "registration_deadline": registration_deadline,
        "start_date": start_date,
        "end_date": end_date,
        "source_url": normalize_url(page_url),
    }


def discover_results(queries, num_results=5, profile=None, opportunity_type="internship"):
    if not isinstance(num_results, int) or isinstance(num_results, bool) or num_results < 1:
        raise ValueError("num_results must be a positive integer")

    if isinstance(queries, str):
        queries = [queries]

    if not isinstance(queries, (list, tuple)):
        raise ValueError("queries must be a list or tuple")

    discovered_by_url = {}

    for query in unique_strings(queries):
        try:
            results = search_google(query, num_results=num_results)
        except Exception as exc:
            print(f"Search failed for '{query}': {exc}")
            continue

        if not isinstance(results, (list, tuple)):
            continue

        for result in results:
            if not isinstance(result, dict):
                continue

            url = normalize_url(result.get("link", ""))

            if not url or not is_valid_http_url(url):
                continue

            title = safe_text(result.get("title"))
            snippet = safe_text(result.get("snippet"))

            if not title:
                continue

            search_result = {
                **result,
                "title": title,
                "snippet": snippet,
                "link": url,
            }

            if is_likely_generic_page(search_result):
                continue

            if mentions_closed_registration(search_result):
                continue

            html, final_url = fetch_page(url)

            if html:
                details = extract_page_details(
                    html,
                    final_url,
                    fallback_title=title,
                    fallback_description=snippet,
                )
            else:
                details = {
                    "title": title,
                    "company": "",
                    "organizer": "",
                    "location": "",
                    "description": snippet,
                    "skills": "",
                    "stipend": "",
                    "internship_type": "",
                    "deadline": None,
                    "themes": "",
                    "event_type": "",
                    "participation_mode": "",
                    "registration_deadline": None,
                    "start_date": None,
                    "end_date": None,
                    "source_url": url,
                }

            final_url = normalize_url(details.get("source_url")) or url
            details["source_url"] = final_url

            scoring_result = {
                "title": details["title"],
                "snippet": details["description"],
            }

            score, matched_preferences = score_relevance(
                scoring_result,
                profile,
            )

            candidate = {
                **details,
                "source": safe_text(result.get("source")),
                "query": query,
                "relevance_score": score,
                "matched_preferences": matched_preferences,
            }

            if opportunity_type == "internship":
                if not candidate.get("company"):
                    candidate["company"] = ""
            elif opportunity_type == "hackathon":
                if not candidate.get("organizer"):
                    candidate["organizer"] = ""

            existing = discovered_by_url.get(final_url)

            if existing is None:
                discovered_by_url[final_url] = candidate
            else:
                existing_score = existing["relevance_score"]
                if score > existing_score:
                    discovered_by_url[final_url] = candidate
                else:
                    for key, value in candidate.items():
                        if value and not existing.get(key):
                            existing[key] = value

    discovered = list(discovered_by_url.values())
    discovered.sort(key=lambda item: item["relevance_score"], reverse=True)

    return discovered


def discover_internships(num_results=5, profile=None):
    return discover_results(
        build_internship_queries(profile),
        num_results=num_results,
        profile=profile,
        opportunity_type="internship",
    )


def discover_hackathons(num_results=5, profile=None):
    return discover_results(
        build_hackathon_queries(profile),
        num_results=num_results,
        profile=profile,
        opportunity_type="hackathon",
    )

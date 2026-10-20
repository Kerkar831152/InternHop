
import json
import re
from datetime import date, datetime
from html import unescape
from urllib.parse import (
    parse_qsl,
    urlencode,
    urldefrag,
    urlsplit,
    urlunsplit,
)

import requests
from bs4 import BeautifulSoup

from .serpapi import search_google


CURRENT_YEAR = date.today().year

INTERNSHIP_QUERIES = [
    f"site:unstop.com/internships software engineering internship India {CURRENT_YEAR}",
    f"site:internshala.com/internship software developer internship India {CURRENT_YEAR}",
    f"site:linkedin.com/jobs/view software engineering internship India {CURRENT_YEAR}",
    f"software engineering internship India students applications open {CURRENT_YEAR}",
]

HACKATHON_QUERIES = [
    f"site:unstop.com hackathon students registration {CURRENT_YEAR}",
    f"site:devpost.com hackathons {CURRENT_YEAR} registration",
    f"site:devfolio.co hackathon registration {CURRENT_YEAR}",
    f"site:hackerearth.com/challenges hackathon registration {CURRENT_YEAR}",
    f"student hackathon India registration open {CURRENT_YEAR}",
    f"online hackathon students registration open {CURRENT_YEAR}",
]

TRUSTED_HACKATHON_DOMAINS = {
    "unstop.com": 5,
    "devpost.com": 5,
    "devfolio.co": 5,
    "hackerearth.com": 4,
    "reskilll.com": 3,
}

TRUSTED_INTERNSHIP_DOMAINS = {
    "unstop.com": 5,
    "internshala.com": 5,
    "linkedin.com": 3,
}

GENERIC_URL_PATTERNS = [
    r"(^|\.)foundit\.in/search/",
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
    "hackathons you can participate in",
    "best websites for internships",
    "internship tips",
    "internship listings",
    "browse hackathons",
    "explore hackathons",
    "all hackathons",
]

CLOSED_TITLE_PHRASES = [
    "registration closed",
    "registrations closed",
    "applications closed",
    "applications are closed",
    "registration has ended",
    "registrations have ended",
    "event has ended",
    "event is over",
    "deadline passed",
    "registration deadline passed",
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

    output = []

    for item in values:
        if isinstance(item, dict):
            item = item.get("name") or item.get("value")

        text = safe_text(item)

        if text:
            output.append(text)

    return output


def clean_query_value(value):
    value = safe_text(value)

    return re.sub(
        r"\s+",
        " ",
        re.sub(r"[^\w\s.+#/-]", " ", value),
    ).strip()


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
    roles = get_profile_values(
        profile, "preferred_roles", "roles", "interests"
    )
    locations = get_profile_values(
        profile,
        "preferred_locations",
        "locations",
        "location",
        "preferred_location",
    )
    course = get_profile_values(
        profile, "course", "degree", "field_of_study"
    )
    year = get_profile_values(
        profile, "year_of_study", "study_year", "year"
    )

    if roles:
        queries.append(
            f"{roles[0]} internship applications open India {CURRENT_YEAR}"
        )

    if skills:
        queries.append(
            f"{' '.join(skills[:3])} internship students India {CURRENT_YEAR}"
        )

    if locations:
        queries.append(
            f"internship {' '.join(locations[:2])} students"
        )

    if course and year:
        queries.append(
            f"{course[0]} year {year[0]} internship India {CURRENT_YEAR}"
        )

    return unique_strings(queries)


def build_hackathon_queries(profile=None):
    queries = list(HACKATHON_QUERIES)

    skills = get_profile_values(profile, "skills")
    interests = get_profile_values(
        profile,
        "preferred_roles",
        "interests",
        "fields_of_interest",
    )
    locations = get_profile_values(
        profile,
        "preferred_locations",
        "locations",
        "location",
        "preferred_location",
    )

    if skills:
        queries.append(
            f"{' '.join(skills[:3])} hackathon registration {CURRENT_YEAR}"
        )

    if interests:
        queries.append(
            f"{interests[0]} hackathon students registration {CURRENT_YEAR}"
        )

    if locations:
        queries.append(
            f"hackathon {' '.join(locations[:2])} students {CURRENT_YEAR}"
        )

    return unique_strings(queries)


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
            for key, value in parse_qsl(
                parsed.query, keep_blank_values=True
            )
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


def get_source_priority(url, opportunity_type="internship"):
    try:
        hostname = (
            urlsplit(url).hostname or ""
        ).lower().removeprefix("www.")
    except ValueError:
        return 0

    priorities = (
        TRUSTED_HACKATHON_DOMAINS
        if opportunity_type == "hackathon"
        else TRUSTED_INTERNSHIP_DOMAINS
    )

    for domain, priority in priorities.items():
        if hostname == domain or hostname.endswith("." + domain):
            return priority

    return 0


def is_trusted_source(url, opportunity_type="internship"):
    """
    Validate the hostname against the allowlist for the opportunity type.
    Legitimate subdomains are allowed; lookalike domains are not.
    """
    try:
        parsed = urlsplit(url)
        hostname = (
            parsed.hostname or ""
        ).lower().removeprefix("www.")

        if (
            parsed.scheme.lower() not in {"http", "https"}
            or not hostname
            or "." not in hostname
            or parsed.username is not None
            or parsed.password is not None
        ):
            return False

        priorities = (
            TRUSTED_HACKATHON_DOMAINS
            if opportunity_type == "hackathon"
            else TRUSTED_INTERNSHIP_DOMAINS
        )

        return any(
            hostname == domain or hostname.endswith("." + domain)
            for domain in priorities
        )

    except (TypeError, ValueError):
        return False


def has_old_year_without_current_context(result):
    text = (
        f"{safe_text(result.get('title'))} "
        f"{safe_text(result.get('snippet'))}"
    )

    years = [
        int(year)
        for year in re.findall(r"\b20\d{2}\b", text)
    ]

    if not years:
        return False

    return max(years) < date.today().year - 1


def mentions_closed_registration(result):
    text = (
        f"{safe_text(result.get('title'))} "
        f"{safe_text(result.get('snippet'))}"
    ).casefold()

    return any(
        phrase in text for phrase in CLOSED_TITLE_PHRASES
    )


def is_likely_generic_page(result):
    title = safe_text(result.get("title")).casefold()
    url = safe_text(result.get("link"))

    try:
        parsed = urlsplit(url)
        hostname = (
            parsed.hostname or ""
        ).lower().removeprefix("www.")
        path = parsed.path.rstrip("/").casefold()
    except ValueError:
        return True

    if not hostname:
        return True

    if any(
        re.search(pattern, hostname + path, re.I)
        for pattern in GENERIC_URL_PATTERNS
    ):
        return True

    full_path = hostname + path

    generic_paths = {
        "unstop.com",
        "unstop.com/hackathons",
        "unstop.com/internships",
        "devpost.com",
        "devpost.com/hackathons",
        "devfolio.co",
        "devfolio.co/hackathons",
        "hackerearth.com",
        "hackerearth.com/challenges",
        "hackerearth.com/challenges/hackathon",
        "internshala.com/internships",
        "internshala.com/hackathons",
    }

    if full_path in generic_paths:
        return True

    if any(
        phrase in title for phrase in GENERIC_TITLE_PHRASES
    ):
        return True

    return has_old_year_without_current_context(result)


def contains_phrase(text, phrase):
    phrase = safe_text(phrase)

    if not phrase:
        return False

    pattern = (
        r"(?<!\w)"
        + re.escape(phrase).replace(r"\ ", r"\s+")
        + r"(?!\w)"
    )

    return re.search(pattern, text, re.IGNORECASE) is not None


def score_relevance(result, profile=None):
    if not isinstance(profile, dict) or not profile:
        return 0, []

    title = safe_text(result.get("title")).casefold()
    snippet = safe_text(result.get("snippet")).casefold()
    text = f"{title} {snippet}"

    skills = get_profile_values(profile, "skills")
    roles = get_profile_values(
        profile, "preferred_roles", "roles", "interests",
        "fields_of_interest",
    )
    locations = get_profile_values(
        profile, "preferred_locations", "locations",
        "location", "preferred_location",
    )
    course = get_profile_values(
        profile, "course", "degree", "field_of_study"
    )
    year = get_profile_values(
        profile, "year_of_study", "study_year", "year"
    )

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

            content_type = response.headers.get(
                "Content-Type", ""
            ).lower()

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

            return (
                content.decode(encoding, errors="replace"),
                response.url,
            )

    except (
        requests.RequestException,
        UnicodeError,
        ValueError,
    ):
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

    for script in soup.find_all(
        "script", type="application/ld+json"
    ):
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
        return [
            safe_text(item).casefold() for item in value
        ]

    return []


def first_value(*values):
    for value in values:
        if isinstance(value, dict):
            value = (
                value.get("name")
                or value.get("value")
                or value.get("address")
            )

        if isinstance(value, list):
            value = ", ".join(
                safe_text(
                    item.get("name")
                    if isinstance(item, dict)
                    else item
                )
                for item in value
                if safe_text(
                    item.get("name")
                    if isinstance(item, dict)
                    else item
                )
            )

        text = safe_text(value)

        if text:
            return text

    return ""


def extract_date(value):
    if isinstance(value, dict):
        value = (
            value.get("startDate")
            or value.get("endDate")
            or value.get("value")
        )

    value = safe_text(value)

    if not value:
        return None

    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        pass

    try:
        return datetime.fromisoformat(
            value.replace("Z", "+00:00")
        ).date()
    except ValueError:
        pass

    formats = (
        "%B %d, %Y",
        "%b %d, %Y",
        "%d %B %Y",
        "%d %b %Y",
    )

    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue

    return None


def extract_dates_from_text(value):
    value = safe_text(value)

    if not value:
        return []

    months = (
        r"January|February|March|April|May|June|July|August|"
        r"September|October|November|December|"
        r"Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec"
    )

    patterns = [
        r"\b20\d{2}[-/]\d{1,2}[-/]\d{1,2}\b",
        rf"\b(?:{months})\s+\d{{1,2}},?\s+20\d{{2}}\b",
        rf"\b\d{{1,2}}\s+(?:{months})\s+20\d{{2}}\b",
    ]

    matches = []

    for pattern in patterns:
        matches.extend(
            re.finditer(pattern, value, re.IGNORECASE)
        )

    matches.sort(key=lambda match: match.start())

    dates = []

    for match in matches:
        parsed = extract_date(match.group(0))

        if parsed is not None and parsed not in dates:
            dates.append(parsed)

    return sorted(dates)


def detect_country(*values):
    text = " ".join(
        safe_text(value) for value in values
    ).casefold()

    country_patterns = [
        ("India", r"\b(india|indian|bharat)\b"),
        ("United States", r"\b(united states|usa|u\.s\.a\.|u\.s\.)\b"),
        ("United Kingdom", r"\b(united kingdom|uk|britain|england)\b"),
        ("Canada", r"\bcanada\b"),
        ("Australia", r"\baustralia\b"),
        ("Singapore", r"\bsingapore\b"),
        ("Germany", r"\bgermany\b"),
        ("France", r"\bfrance\b"),
    ]

    for country, pattern in country_patterns:
        if re.search(pattern, text):
            return country

    return ""


def extract_page_details(
    html,
    page_url,
    fallback_title="",
    fallback_description="",
):
    soup = BeautifulSoup(html, "html.parser")
    objects = get_jsonld_objects(soup)

    title = ""
    description = ""
    company = ""
    organizer = ""
    location = ""
    country = ""
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
        'meta[name="twitter:description"]',
    ):
        tag = soup.select_one(selector)

        if tag and tag.get("content"):
            description = safe_text(tag["content"])
            break

    for obj in objects:
        types = schema_types(obj)

        if not title:
            title = first_value(obj.get("name"), obj.get("title"))

        if not description:
            description = first_value(obj.get("description"))

        if any("jobposting" in item for item in types):
            company = first_value(
                obj.get("hiringOrganization"), company
            )

            job_location = obj.get("jobLocation")
            location = first_value(job_location, location)

            if isinstance(job_location, dict):
                address = job_location.get("address", {})

                if isinstance(address, dict):
                    country = first_value(
                        address.get("addressCountry"), country
                    )

            skills = first_value(
                obj.get("skills"),
                obj.get("qualifications"),
                skills,
            )

            internship_type = first_value(
                obj.get("employmentType"), internship_type
            )

            base_salary = obj.get("baseSalary")

            if isinstance(base_salary, dict):
                salary_value = base_salary.get("value", {})

                if isinstance(salary_value, dict):
                    minimum = salary_value.get("minValue")
                    maximum = salary_value.get("maxValue")
                    currency = salary_value.get("currency", "")
                    unit = salary_value.get("unitText", "")

                    if minimum is not None and maximum is not None:
                        stipend = (
                            f"{minimum}-{maximum} {currency} {unit}"
                        ).strip()
                    elif minimum is not None:
                        stipend = f"{minimum} {currency} {unit}".strip()
                    elif maximum is not None:
                        stipend = f"{maximum} {currency} {unit}".strip()

            deadline = extract_date(
                obj.get("validThrough")
            ) or deadline

        if any(
            item in {"event", "hackathon", "festival"}
            for item in types
        ):
            organizer = first_value(
                obj.get("organizer"), organizer
            )

            event_location = obj.get("location")
            location = first_value(event_location, location)

            if isinstance(event_location, dict):
                address = event_location.get("address", {})

                if isinstance(address, dict):
                    country = first_value(
                        address.get("addressCountry"), country
                    )

            start_date = (
                extract_date(obj.get("startDate")) or start_date
            )
            end_date = (
                extract_date(obj.get("endDate")) or end_date
            )

            attendance_mode = safe_text(
                obj.get("eventAttendanceMode")
            ).casefold()

            if "onlineeventattendance" in attendance_mode:
                participation_mode = "online"
            elif "mixedeventattendance" in attendance_mode:
                participation_mode = "hybrid"
            elif "offlineeventattendance" in attendance_mode:
                participation_mode = "offline"

        company = company or first_value(
            obj.get("hiringOrganization")
        )
        organizer = organizer or first_value(
            obj.get("organizer")
        )

    text = safe_text(soup.get_text(" ", strip=True))

    title = title or safe_text(fallback_title)
    description = description or safe_text(fallback_description)

    if not company:
        match = re.search(
            r"(?:company|employer)\s*[:\-]\s*([^|.;]{2,120})",
            text,
            re.IGNORECASE,
        )

        if match:
            company = safe_text(match.group(1))

    if not location:
        match = re.search(
            r"(?:job location|location)\s*[:\-]\s*([^|.;]{2,100})",
            text,
            re.IGNORECASE,
        )

        if match:
            location = safe_text(match.group(1))

    if not stipend:
        match = re.search(
            r"(?:stipend|salary|compensation)\s*[:\-]\s*"
            r"((?:INR|Rs\.?|₹|\$)?\s*[\d,]+"
            r"(?:\s*[-–to]+\s*[\d,]+)?"
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
        if re.search(
            r"\b(remote|work from home)\b", text, re.IGNORECASE
        ):
            internship_type = "Remote"
        elif re.search(r"\bhybrid\b", text, re.IGNORECASE):
            internship_type = "Hybrid"
        elif re.search(
            r"\bon[- ]site\b", text, re.IGNORECASE
        ):
            internship_type = "On-site"

    if not themes:
        match = re.search(
            r"(?:themes?|tracks?)\s*[:\-]\s*"
            r"(.{2,250}?)(?:\.|deadline|registration|$)",
            text,
            re.IGNORECASE,
        )

        if match:
            themes = safe_text(match.group(1))

    if not event_type and re.search(
        r"\b(hackathon|coding challenge)\b",
        title,
        re.IGNORECASE,
    ):
        event_type = "Hackathon"

    if not participation_mode:
        if re.search(r"\bonline\b|\bvirtual\b", text, re.IGNORECASE):
            participation_mode = "online"
        elif re.search(r"\bhybrid\b", text, re.IGNORECASE):
            participation_mode = "hybrid"
        elif re.search(
            r"\bin[- ]person\b|\bon[- ]site\b",
            text,
            re.IGNORECASE,
        ):
            participation_mode = "offline"

    date_pattern = (
        r"(20\d{2}[-/]\d{1,2}[-/]\d{1,2}"
        r"|[A-Za-z]{3,9}\s+\d{1,2},?\s+20\d{2}"
        r"|\d{1,2}\s+[A-Za-z]{3,9}\s+20\d{2})"
    )

    if not registration_deadline:
        match = re.search(
            r"(?:registration deadline|register by|last date to register|"
            r"last date to apply|application deadline|apply by|"
            r"registration closes|registration ends|applications close)"
            r"\s*[:\-]?\s*" + date_pattern,
            text,
            re.IGNORECASE,
        )

        if match:
            registration_deadline = extract_date(match.group(1))

    if not start_date or not end_date:
        event_match = re.search(
            r"(?:hackathon dates|event dates|event schedule|event period|"
            r"event date|starts on|start date|event starts)"
            r"\s*[:\-]?\s*(.{0,180})",
            text,
            re.IGNORECASE,
        )

        if event_match:
            event_dates = extract_dates_from_text(
                event_match.group(1)
            )

            if event_dates:
                start_date = start_date or event_dates[0]

                if len(event_dates) > 1:
                    end_date = end_date or event_dates[-1]
                else:
                    end_date = end_date or event_dates[0]

    if not deadline:
        deadline = registration_deadline

    country = country or detect_country(
        location, text, title, description
    )

    return {
        "title": title,
        "company": company,
        "organizer": organizer,
        "location": location,
        "country": country,
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


def discover_results(
    queries,
    num_results=5,
    profile=None,
    opportunity_type="internship",
):
    if (
        not isinstance(num_results, int)
        or isinstance(num_results, bool)
        or num_results < 1
    ):
        raise ValueError("num_results must be a positive integer")

    if isinstance(queries, str):
        queries = [queries]

    if not isinstance(queries, (list, tuple)):
        raise ValueError("queries must be a list or tuple")

    if opportunity_type not in {"internship", "hackathon"}:
        raise ValueError(
            "opportunity_type must be 'internship' or 'hackathon'"
        )

    discovered_by_url = {}
    search_failures = []

    for query in unique_strings(queries):
        try:
            results = search_google(
                query, num_results=num_results
            )
        except Exception as exc:
            message = f"Search failed for '{query}': {exc}"
            search_failures.append(message)
            print(message)
            continue

        if not isinstance(results, (list, tuple)):
            continue

        for result in results:
            if not isinstance(result, dict):
                continue

            url = normalize_url(result.get("link", ""))

            if (
                not url
                or not is_valid_http_url(url)
                or not is_trusted_source(url, opportunity_type)
            ):
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

            html, final_page_url = fetch_page(url)

            # Do not save records based only on search-engine snippets.
            if not html:
                continue

            final_page_url = normalize_url(final_page_url)

            # Validate the redirect destination before extracting data.
            if (
                not final_page_url
                or not is_valid_http_url(final_page_url)
                or not is_trusted_source(
                    final_page_url, opportunity_type
                )
            ):
                continue

            details = extract_page_details(
                html,
                final_page_url,
                fallback_title=title,
                fallback_description=snippet,
            )

            final_url = normalize_url(
                details.get("source_url")
            ) or final_page_url

            if (
                not is_valid_http_url(final_url)
                or not is_trusted_source(final_url, opportunity_type)
            ):
                continue

            details["source_url"] = final_url

            candidate_title = (
                safe_text(details.get("title")) or title
            )
            candidate_description = (
                safe_text(details.get("description")) or snippet
            )

            if is_likely_generic_page({
                "title": candidate_title,
                "snippet": candidate_description,
                "link": final_url,
            }):
                continue

            if mentions_closed_registration({
                "title": candidate_title,
                "snippet": candidate_description,
            }):
                continue

            today = date.today()

            if opportunity_type == "internship":
                deadline = details.get("deadline")

                if deadline and deadline < today:
                    continue
            else:
                registration_deadline = details.get(
                    "registration_deadline"
                )
                end_date = details.get("end_date")

                if (
                    registration_deadline
                    and registration_deadline < today
                ):
                    continue

                if end_date and end_date < today:
                    continue

            scoring_result = {
                "title": candidate_title,
                "snippet": candidate_description,
            }

            score, matched_preferences = score_relevance(
                scoring_result, profile
            )

            source_priority = get_source_priority(
                final_url, opportunity_type
            )

            score += source_priority

            candidate = {
                **details,
                "title": candidate_title,
                "description": candidate_description,
                "source": safe_text(result.get("source")),
                "query": query,
                "relevance_score": score,
                "matched_preferences": matched_preferences,
                "source_priority": source_priority,
            }

            existing = discovered_by_url.get(final_url)

            if existing is None:
                discovered_by_url[final_url] = candidate

            elif score > existing["relevance_score"]:
                for key, value in existing.items():
                    if value and not candidate.get(key):
                        candidate[key] = value

                discovered_by_url[final_url] = candidate

            else:
                for key, value in candidate.items():
                    if value and not existing.get(key):
                        existing[key] = value

    discovered = list(discovered_by_url.values())

    discovered.sort(
        key=lambda item: (
            item.get("relevance_score", 0),
            item.get("source_priority", 0),
            bool(
                item.get("deadline")
                or item.get("registration_deadline")
            ),
        ),
        reverse=True,
    )

    if search_failures and not discovered:
        print(
            f"All searches failed or returned no usable results. "
            f"Failed searches: {len(search_failures)}"
        )

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

import re
from datetime import date
from urllib.parse import urldefrag, urlparse

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
   
    r"foundit\.in/search/",
    r"internshala\.com/internships/",
    r"linkedin\.com/jobs/(search|collections)",
    r"indeed\.[^/]+/q-",
    r"glassdoor\.[^/]+/Job/",

  
    r"prosple\.com/internships(-india|/internships)",
    r"openhackathons\.org/s/?$",
    r"eventbrite\.com/d/[^/]+/hackathons",

  
    r"reddit\.com/",
    r"facebook\.com/",
    r"youtube\.com/",
    r"scribd\.com/",
]

GENERIC_TITLE_PHRASES = [
    "career advice",
    "student guide",
    "how to find internships",
    "how to get an internship",
    "top hackathons",
    "best hackathons",
    "list of hackathons",
    "hackathons events and activities",
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


def as_list(value):
    """
    Convert a profile field into a clean list of strings.

    Supports:
        "Python, Django"
        ["Python", "Django"]
        None
    """
    if not value:
        return []

    if isinstance(value, str):
        value = re.split(r"[,;\n]", value)

    if not isinstance(value, (list, tuple, set)):
        return []

    return [
        str(item).strip()
        for item in value
        if str(item).strip()
    ]


def clean_query_value(value):
    """
    Remove characters that are not useful in a search query.
    """
    return re.sub(r"[^\w\s.+#-]", " ", str(value)).strip()


def unique_strings(values):
    """
    Remove empty and duplicate strings while preserving order.
    """
    output = []
    seen = set()

    for value in values:
        value = clean_query_value(value)

        if not value:
            continue

        key = value.casefold()

        if key not in seen:
            seen.add(key)
            output.append(value)

    return output


def get_profile_values(profile, *keys):
    """
    Read the first available profile field from a dictionary.
    """
    if not isinstance(profile, dict):
        return []

    for key in keys:
        if profile.get(key):
            return as_list(profile[key])

    return []


def build_internship_queries(profile=None):
    """
    Build internship searches using the user's preferences.
    """
    queries = list(INTERNSHIP_QUERIES)

    skills = get_profile_values(profile, "skills")
    roles = get_profile_values(
        profile,
        "preferred_roles",
        "roles",
        "interests",
    )
    locations = get_profile_values(
        profile,
        "locations",
        "location",
        "preferred_location",
    )
    course = get_profile_values(
        profile,
        "course",
        "degree",
        "field_of_study",
    )
    year = get_profile_values(
        profile,
        "year_of_study",
        "study_year",
        "year",
    )


    if roles:
        queries.append(
            f"{roles[0]} internship applications open"
        )

   
    if skills:
        skill_query = " ".join(skills[:3])
        queries.append(
            f"{skill_query} internship students"
        )

  
    if locations:
        queries.append(
            f"internship {' '.join(locations[:2])} students"
        )

  
    if course and year:
        queries.append(
            f"{course[0]} year {year[0]} internship"
        )

    return unique_strings(queries)[:6]


def build_hackathon_queries(profile=None):
    """
    Build hackathon searches using skills and location.
    """
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
        "locations",
        "location",
        "preferred_location",
    )

    if skills:
        queries.append(
            f"{' '.join(skills[:3])} hackathon registration"
        )

    if interests:
        queries.append(
            f"{interests[0]} hackathon students"
        )

    if locations:
        queries.append(
            f"hackathon {' '.join(locations[:2])} students"
        )

    return unique_strings(queries)[:6]


def normalize_url(url):
    """
    Remove fragments and trailing slashes for deduplication.
    """
    if not url:
        return ""

    url = urldefrag(url.strip())[0]
    return url.rstrip("/")


def is_valid_http_url(url):
    """
    Only accept valid HTTP or HTTPS URLs.
    """
    try:
        parsed = urlparse(url)

        return (
            parsed.scheme in ("http", "https")
            and bool(parsed.netloc)
            and "." in parsed.netloc
        )
    except ValueError:
        return False


def has_old_year_without_current_context(result):
    """
    Flag results that mention only old years.

    This is a heuristic. It cannot prove that an
    opportunity has expired.
    """
    text = " ".join([
        result.get("title", ""),
        result.get("snippet", ""),
    ])

    years = [
        int(year)
        for year in re.findall(r"\b20\d{2}\b", text)
    ]

    if not years:
        return False

    current_year = date.today().year

   
    if any(year >= current_year for year in years):
        return False


    return max(years) < current_year - 1


def mentions_closed_registration(result):
    """
    Detect wording that may indicate a closed opportunity.
    """
    text = " ".join([
        result.get("title", ""),
        result.get("snippet", ""),
    ]).casefold()

    return any(
        phrase in text
        for phrase in CLOSED_TITLE_PHRASES
    )


def is_likely_generic_page(result):
    """
    Return True when a result appears to be a generic page
    rather than a specific opportunity.
    """
    title = result.get("title", "").casefold()
    url = result.get("link", "").casefold()

    for pattern in GENERIC_URL_PATTERNS:
        if re.search(pattern, url):
            return True

    if any(
        phrase in title
        for phrase in GENERIC_TITLE_PHRASES
    ):
        return True

    if has_old_year_without_current_context(result):
        return True

    return False


def score_relevance(result, profile=None):
    """
    Rank a result against the user's profile.

    This is a simple keyword-based score, not AI verification.
    """
    if not isinstance(profile, dict) or not profile:
        return 0, []

    title = result.get("title", "").casefold()
    snippet = result.get("snippet", "").casefold()
    text = f"{title} {snippet}"

    skills = get_profile_values(profile, "skills")
    roles = get_profile_values(
        profile,
        "preferred_roles",
        "roles",
        "interests",
        "fields_of_interest",
    )
    locations = get_profile_values(
        profile,
        "locations",
        "location",
        "preferred_location",
    )

    score = 0
    matched_preferences = []

  
    for skill in skills:
        skill_lower = skill.casefold()

        if skill_lower in title:
            score += 3
            matched_preferences.append(skill)
        elif skill_lower in snippet:
            score += 1
            matched_preferences.append(skill)

    for role in roles:
        role_lower = role.casefold()

        if role_lower in title:
            score += 3
            matched_preferences.append(role)
        elif role_lower in snippet:
            score += 1
            matched_preferences.append(role)

    for location in locations:
        location_lower = location.casefold()

        if location_lower in text:
            score += 2
            matched_preferences.append(location)

    # Remove duplicate preference labels.
    matched_preferences = list(dict.fromkeys(matched_preferences))

    return score, matched_preferences


def discover_results(queries, num_results=5, profile=None):
    """
    Fetch Google results, filter poor candidates, remove
    duplicate URLs, and rank the remaining results.
    """
    discovered = []
    seen_urls = set()

    for query in queries:
        try:
            results = search_google(
                query,
                num_results=num_results,
            )
        except (RuntimeError, ValueError) as exc:
            print(f"Search failed for '{query}': {exc}")
            continue

        for result in results:
            url = normalize_url(result.get("link", ""))

            if not is_valid_http_url(url):
                continue

            if url in seen_urls:
                continue

            if is_likely_generic_page(result):
                continue

            if mentions_closed_registration(result):
                continue

            score, matched_preferences = score_relevance(
                result,
                profile,
            )

            seen_urls.add(url)

            discovered.append({
                "title": result.get("title", "").strip(),
                "source_url": url,
                "description": result.get("snippet", "").strip(),
                "source": result.get("source", ""),
                "query": query,
                "relevance_score": score,
                "matched_preferences": matched_preferences,
            })

    
    discovered.sort(
        key=lambda item: item["relevance_score"],
        reverse=True,
    )

    return discovered



def discover_internships(num_results=5, profile=None):
    queries = build_internship_queries(profile)

    return discover_results(
        queries,
        num_results=num_results,
        profile=profile,
    )


def discover_hackathons(num_results=5, profile=None):
    queries = build_hackathon_queries(profile)

    return discover_results(
        queries,
        num_results=num_results,
        profile=profile,
    )
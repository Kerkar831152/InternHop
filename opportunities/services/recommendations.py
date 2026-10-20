import re
import unicodedata
from datetime import date, datetime

from django.utils import timezone

from internships.models import Internship
from hackathons.models import Hackathon


LOCATION_ALIASES = {
    "panjim": "panaji",
    "madgaon": "margao",
    "bangalore": "bengaluru",
    "gurgaon": "gurugram",
    "cochin": "kochi",
    "mysore": "mysuru",
}

REMOTE_LOCATIONS = {
    "remote",
    "online",
    "fully remote",
    "remote only",
    "online only",
    "anywhere",
    "worldwide",
    "work from home",
    "wfh",
}

ONLINE_MODES = {
    "remote",
    "online",
    "fully remote",
    "remote only",
    "online only",
    "fully online",
    "virtual",
    "work from home",
    "wfh",
}

OFFLINE_MODES = {
    "onsite",
    "on site",
    "in person",
    "offline",
    "in person only",
}

ANY_MODES = {
    "any",
    "any mode",
    "all",
    "flexible",
}


def normalize(value):
    if value is None:
        return ""

    value = unicodedata.normalize("NFKC", str(value)).lower().strip()
    value = re.sub(r"[^a-z0-9]+", " ", value)

    words = value.split()
    words = [LOCATION_ALIASES.get(word, word) for word in words]

    return " ".join(words)


def as_list(value):
    if value is None:
        return []

    if isinstance(value, str):
        return [
            item.strip()
            for item in value.split(",")
            if item.strip()
        ]

    if isinstance(value, (list, tuple, set)):
        result = []

        for item in value:
            if isinstance(item, str) and item.strip():
                result.append(item.strip())

        return result

    return [str(value).strip()] if str(value).strip() else []


def profile_values(profile, field):
    return as_list(getattr(profile, field, None))


def location_parts(value):
    """
    Convert 'Panaji, Goa, India' into normalized location components.
    Also preserve the complete normalized location.
    """
    if not value:
        return set()

    parts = {
        normalize(part)
        for part in str(value).split(",")
        if normalize(part)
    }

    complete = normalize(value)

    if complete:
        parts.add(complete)

    return parts


def location_matches(opportunity_location, preferred_locations):
    """
    Match explicit locations, including combined preferences.

    Examples:
      Preferred 'Goa' matches 'Panaji, Goa, India'.
      Preferred 'Panaji' matches 'Panaji, Goa, India'.
      Preferred 'Panaji, Goa' matches 'Panaji, Goa, India'.

    An unknown location never counts as a match.
    """
    actual = location_parts(opportunity_location)

    if not actual:
        return False

    for preferred in preferred_locations:
        wanted = normalize(preferred)

        if not wanted:
            continue

        if wanted in actual:
            return True

        # Match complete phrases without allowing arbitrary partial words.
        for actual_location in actual:
            if (
                actual_location
                and (
                    f" {wanted} " in f" {actual_location} "
                    or f" {actual_location} " in f" {wanted} "
                )
            ):
                return True

        # Handle a preference stored as a combined comma-separated string.
        original_parts = [
            normalize(part)
            for part in str(preferred).split(",")
            if normalize(part)
        ]

        if original_parts and all(part in actual for part in original_parts):
            return True

    return False


def is_remote(value):
    return normalize(value) in {
        normalize(item) for item in REMOTE_LOCATIONS
    }


def remote_is_allowed(profile):
    mode = normalize(getattr(profile, "work_mode", ""))

    if mode in {normalize(item) for item in ANY_MODES}:
        return True

    return mode in {
        normalize(item) for item in ONLINE_MODES
    }


def work_mode_matches(preferred_mode, opportunity_mode):
    """
    Match recognized work modes without guessing unknown labels.
    """
    preferred = normalize(preferred_mode)
    actual = normalize(opportunity_mode)

    if not preferred:
        return True

    if not actual or actual in {
        "unknown",
        "not specified",
        "na",
        "n a",
    }:
        return False

    online_modes = {normalize(item) for item in ONLINE_MODES}
    offline_modes = {normalize(item) for item in OFFLINE_MODES}

    if preferred in {normalize(item) for item in ANY_MODES}:
        return actual in online_modes | offline_modes | {"hybrid"}

    if preferred in online_modes:
        return actual in online_modes or actual == "hybrid"

    if preferred in offline_modes:
        return actual in offline_modes or actual == "hybrid"

    if preferred == "hybrid":
        return actual == "hybrid"

    return preferred == actual


def text_matches(preferences, text):
    normalized_text = f" {normalize(text)} "

    return [
        item
        for item in preferences
        if normalize(item)
        and f" {normalize(item)} " in normalized_text
    ]


def is_past(value):
    if value is None:
        return False

    if isinstance(value, datetime):
        if timezone.is_aware(value):
            return value < timezone.now()

        return value.date() < timezone.localdate()

    if isinstance(value, date):
        return value < timezone.localdate()

    return False


def get_searchable_text(opportunity, is_hackathon):
    title = getattr(opportunity, "title", "") or ""
    description = getattr(opportunity, "description", "") or ""

    if is_hackathon:
        return " ".join([
            title,
            description,
            getattr(opportunity, "themes", "") or "",
            getattr(opportunity, "organizer", "") or "",
        ])

    return " ".join([
        title,
        description,
        getattr(opportunity, "skills", "") or "",
        getattr(opportunity, "company", "") or "",
    ])


def opportunity_is_online(opportunity, is_hackathon):
    if is_hackathon:
        mode = normalize(
            getattr(opportunity, "participation_mode", "")
        )

        return mode in (
            {normalize(item) for item in ONLINE_MODES}
            | {"hybrid"}
        )

    internship_type = normalize(
        getattr(opportunity, "internship_type", "")
    )

    return internship_type in (
        {normalize(item) for item in ONLINE_MODES}
        | {"hybrid"}
    )


def calculate_match(profile, opportunity, is_hackathon=False):
    """
    Return (score, reasons), or None when mandatory eligibility fails.
    """
    preferred_locations = profile_values(profile, "preferred_locations")
    preferred_roles = profile_values(profile, "preferred_roles")
    skills = profile_values(profile, "skills")

    if not preferred_locations:
        return None

    location = getattr(opportunity, "location", "") or ""
    profile_mode = normalize(getattr(profile, "work_mode", ""))

    # Online opportunities can be location-independent only when the
    # profile permits online work. Hybrid events still need a location
    # match because they may require physical attendance.
    if is_remote(location):
        if not remote_is_allowed(profile):
            return None
    elif not location_matches(location, preferred_locations):
        return None

    # Only recommend hackathons whose country is explicitly India.
    if is_hackathon:
        country = normalize(getattr(opportunity, "country", ""))

        if country != "india":
            return None

    if profile_mode:
        if is_hackathon:
            participation_mode = getattr(
                opportunity, "participation_mode", ""
            )

            if not work_mode_matches(profile_mode, participation_mode):
                return None

        else:
            internship_type = getattr(opportunity, "internship_type", "")

            recognized_modes = (
                {normalize(item) for item in ONLINE_MODES}
                | {normalize(item) for item in OFFLINE_MODES}
                | {"hybrid"}
            )

            # internship_type may mean full-time/part-time rather than
            # remote/onsite. Enforce it only when it is a known work mode.
            if normalize(internship_type) in recognized_modes:
                if not work_mode_matches(profile_mode, internship_type):
                    return None

    searchable_text = get_searchable_text(opportunity, is_hackathon)

    matched_skills = text_matches(skills, searchable_text)
    matched_roles = text_matches(preferred_roles, searchable_text)

    if not matched_skills and not matched_roles:
        return None

    skill_score = (
        60 * len(matched_skills) / len(skills)
        if skills else 0
    )

    role_score = (
        40 * len(matched_roles) / len(preferred_roles)
        if preferred_roles else 0
    )

    available_weight = (
        (60 if skills else 0)
        + (40 if preferred_roles else 0)
    )

    if available_weight == 0:
        return None

    raw_score = (skill_score + role_score) * 100 / available_weight
    score = max(1, min(100, round(raw_score)))

    reasons = [f"Location matches your preferences: {location}"]

    if matched_skills:
        reasons.append(
            "Matching skills: " + ", ".join(matched_skills)
        )

    if matched_roles:
        reasons.append(
            "Matching roles: " + ", ".join(matched_roles)
        )

    if is_hackathon:
        reasons.append("Country verified as India")

    return score, reasons


def rank_opportunities(queryset, profile, limit=20, is_hackathon=False):
    ranked = []

    for opportunity in queryset:
        if normalize(getattr(opportunity, "status", "")) != "active":
            continue

        if not getattr(opportunity, "source_url", ""):
            continue

        if is_hackathon:
            if is_past(getattr(opportunity, "end_date", None)):
                continue

            if is_past(
                getattr(opportunity, "registration_deadline", None)
            ):
                continue
        else:
            if is_past(getattr(opportunity, "deadline", None)):
                continue

        result = calculate_match(
            profile,
            opportunity,
            is_hackathon=is_hackathon,
        )

        if result is None:
            continue

        score, reasons = result

        if score <= 0:
            continue

        opportunity.match_score = score
        opportunity.match_reasons = reasons
        ranked.append(opportunity)

    def ranking_key(item):
        if is_hackathon:
            relevant_deadline = (
                getattr(item, "registration_deadline", None)
                or getattr(item, "end_date", None)
            )
        else:
            relevant_deadline = getattr(item, "deadline", None)

        # Higher match scores rank first. When scores tie, prefer records
        # with a known deadline and then the nearest upcoming deadline.
        return (
            item.match_score,
            relevant_deadline is not None,
            relevant_deadline or date.max,
        )

    ranked.sort(key=ranking_key, reverse=True)

    return ranked[:max(0, limit)]


def rank_internships(profile, limit=20):
    return rank_opportunities(
        Internship.objects.all(),
        profile,
        limit=limit,
        is_hackathon=False,
    )


def rank_hackathons(profile, limit=20):
    return rank_opportunities(
        Hackathon.objects.filter(
            country__iexact="India",
            status=Hackathon.Status.ACTIVE,
        ),
        profile,
        limit=limit,
        is_hackathon=True,
    )
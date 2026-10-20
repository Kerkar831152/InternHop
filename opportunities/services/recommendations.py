
import re
import unicodedata
from datetime import date, datetime

from django.utils import timezone

from internships.models import Internship
from hackathons.models import Hackathon


# Normalize text so small formatting differences don't break matching.
def normalize(value):
    if value is None:
        return ""

    value = unicodedata.normalize("NFKC", str(value)).lower().strip()
    value = re.sub(r"[^a-z0-9]+", " ", value)

    aliases = {
        "panjim": "panaji",
        "madgaon": "margao",
        "bangalore": "bengaluru",
        "gurgaon": "gurugram",
        "cochin": "kochi",
        "mysore": "mysuru",
    }

    words = value.split()
    words = [aliases.get(word, word) for word in words]
    return " ".join(words)


def as_list(value):
    """Support lists, comma-separated strings and JSON-like values."""
    if value is None:
        return []

    if isinstance(value, str):
        return [
            item.strip()
            for item in value.split(",")
            if item.strip()
        ]

    if isinstance(value, (list, tuple, set)):
        return [
            str(item).strip()
            for item in value
            if str(item).strip()
        ]

    return [str(value).strip()] if str(value).strip() else []


def profile_values(profile, field):
    return as_list(getattr(profile, field, None))


def location_parts(value):
    """
    Treat comma-separated location components as individual places.
    Example: 'Panaji, Goa, India' -> {'panaji', 'goa', 'india'}
    """
    if not value:
        return set()

    parts = {
        normalize(part)
        for part in str(value).split(",")
        if normalize(part)
    }

    # Also include the complete normalized value.
    parts.add(normalize(value))
    return parts


def location_matches(opportunity_location, preferred_locations):
    """
    Require an explicit location match.
    No preferred location or unknown location means no match.
    """
    actual = location_parts(opportunity_location)

    if not actual:
        return False

    for preferred in preferred_locations:
        wanted = normalize(preferred)

        if wanted and wanted in actual:
            return True

    return False


def is_remote(value):
    return normalize(value) in {
        "remote",
        "online",
        "fully remote",
        "remote only",
        "online only",
        "anywhere",
        "worldwide",
    }


def remote_is_allowed(profile):
    mode = normalize(getattr(profile, "work_mode", ""))

    return mode in {
        "remote",
        "online",
        "remote only",
        "online only",
        "remote online",
        "any",
        "any mode",
        "all",
    }


def work_mode_matches(preferred_mode, opportunity_mode):
    """
    Compare only known work-mode labels.
    Unknown labels fail closed instead of being guessed.
    """
    preferred = normalize(preferred_mode)
    actual = normalize(opportunity_mode)

    groups = {
        "remote": {"remote", "fully remote", "remote only"},
        "online": {"online", "fully online", "online only"},
        "onsite": {"onsite", "on site", "in person", "offline"},
        "in person": {"onsite", "on site", "in person", "offline"},
        "offline": {"onsite", "on site", "in person", "offline"},
        "hybrid": {"hybrid"},
        "remote only": {"remote", "fully remote", "remote only"},
        "online only": {"online", "fully online", "online only"},
        "any": {"remote", "online", "onsite", "on site", "in person",
                "offline", "hybrid"},
        "any mode": {"remote", "online", "onsite", "on site",
                     "in person", "offline", "hybrid"},
        "all": {"remote", "online", "onsite", "on site",
                "in person", "offline", "hybrid"},
    }

    if not preferred:
        return True

    if not actual or actual in {"unknown", "not specified", "n a"}:
        return False

    accepted = groups.get(preferred)

    if accepted is None:
        return preferred == actual

    return actual in accepted


def text_matches(preferences, text):
    """
    Match whole normalized phrases, not arbitrary partial substrings.
    """
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
        extra = getattr(opportunity, "themes", "") or ""
        organizer = getattr(opportunity, "organizer", "") or ""
        return f"{title} {description} {extra} {organizer}"

    skills = getattr(opportunity, "skills", "") or ""
    company = getattr(opportunity, "company", "") or ""
    return f"{title} {description} {skills} {company}"


def calculate_match(profile, opportunity, is_hackathon=False):
    """
    Return (score, reasons) for eligible and relevant opportunities.
    Return None when any mandatory eligibility rule fails.
    """

    preferred_locations = profile_values(profile, "preferred_locations")
    preferred_roles = profile_values(profile, "preferred_roles")
    skills = profile_values(profile, "skills")

    # Mandatory profile preferences.
    if not preferred_locations:
        return None

    location = getattr(opportunity, "location", "") or ""
    profile_mode = getattr(profile, "work_mode", "") or ""

    # Mandatory location matching.
    # Online events may qualify only if the user's saved work mode
    # explicitly allows online/remote participation.
    if is_remote(location):
        if not remote_is_allowed(profile):
            return None
    elif not location_matches(location, preferred_locations):
        return None

    # Every recommended hackathon must have an explicitly verified country.
    if is_hackathon:
        country = normalize(getattr(opportunity, "country", ""))
        if country != "india":
            return None

    # Enforce internship work mode only when internship_type actually
    # describes a recognized work mode. Otherwise do not confuse it with
    # full-time/part-time employment type.
    if not is_hackathon and profile_mode:
        internship_type = getattr(opportunity, "internship_type", "")
        known_modes = {
            "remote", "online", "fully remote", "remote only",
            "onsite", "on site", "in person", "offline", "hybrid",
        }

        if normalize(internship_type) in known_modes:
            if not work_mode_matches(profile_mode, internship_type):
                return None

    # Hackathon participation mode uses the model's actual choices:
    # online, offline, hybrid, unknown.
    if is_hackathon and profile_mode:
        participation_mode = getattr(
            opportunity, "participation_mode", "unknown"
        )

        mode = normalize(profile_mode)

        if mode in {
            "remote", "online", "remote only", "online only",
            "onsite", "on site", "in person", "offline", "hybrid",
        }:
            if not work_mode_matches(mode, participation_mode):
                return None

    searchable_text = get_searchable_text(opportunity, is_hackathon)

    matched_skills = text_matches(skills, searchable_text)
    matched_roles = text_matches(preferred_roles, searchable_text)

    # A location match alone is not enough to call an opportunity relevant.
    if not matched_skills and not matched_roles:
        return None

    # Score only genuine skill/role matches. Location is a gate, not a bonus.
    skill_score = (
        60 * len(matched_skills) / len(skills)
        if skills else 0
    )
    role_score = (
        40 * len(matched_roles) / len(preferred_roles)
        if preferred_roles else 0
    )

    # Renormalize when a user has only one type of preference.
    available_weight = (60 if skills else 0) + (
        40 if preferred_roles else 0
    )

    if available_weight == 0:
        return None

    raw_score = (
        skill_score + role_score
    ) * 100 / available_weight

    score = max(1, min(100, round(raw_score)))

    reasons = [f"Location matches your preferences: {location}"]

    if matched_skills:
        reasons.append("Matching skills: " + ", ".join(matched_skills))

    if matched_roles:
        reasons.append("Matching roles: " + ", ".join(matched_roles))

    if is_hackathon:
        reasons.append("Country verified as India")

    return score, reasons


def rank_opportunities(queryset, profile, limit=20, is_hackathon=False):
    ranked = []

    for opportunity in queryset:
        # Exclude inactive, closed and expired records.
        if normalize(getattr(opportunity, "status", "")) != "active":
            continue

        # Exclude records with no usable source URL.
        if not getattr(opportunity, "source_url", ""):
            continue

        if is_hackathon:
            # A hackathon is no longer useful after its event has ended.
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

        # Never show a zero-percent match.
        if score <= 0:
            continue

        # Preserve the existing service's return shape for the API.
        opportunity.match_score = score
        opportunity.match_reasons = reasons
        ranked.append(opportunity)

    ranked.sort(
        key=lambda item: item.match_score,
        reverse=True,
    )

    return ranked[:limit]


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

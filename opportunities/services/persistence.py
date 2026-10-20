from datetime import date, datetime
from urllib.parse import parse_qsl, urlencode, urldefrag, urlsplit, urlunsplit

from django.db import transaction
from django.utils import timezone

from internships.models import Internship
from hackathons.models import Hackathon


# Keep these lists aligned with discovery.py.
ALLOWED_DOMAINS = {
    Internship: {
        "unstop.com",
        "internshala.com",
        "linkedin.com",
    },
    Hackathon: {
        "unstop.com",
        "devpost.com",
        "devfolio.co",
        "hackerearth.com",
        "reskilll.com",
    },
}

TRACKING_PREFIXES = ("utm_",)
TRACKING_PARAMETERS = {
    "fbclid",
    "gclid",
    "dclid",
    "msclkid",
    "mc_cid",
    "mc_eid",
}


def normalize_source_url(url):
    if not url:
        return ""

    try:
        parsed = urlsplit(urldefrag(str(url).strip())[0])

        scheme = parsed.scheme.lower()
        hostname = (parsed.hostname or "").lower().removeprefix("www.")

        if scheme not in {"http", "https"} or not hostname:
            return ""

        if parsed.username is not None or parsed.password is not None:
            return ""

        try:
            port = parsed.port
        except ValueError:
            return ""

        if (scheme == "https" and port == 443) or (
            scheme == "http" and port == 80
        ):
            port = None

        netloc = hostname if port is None else f"{hostname}:{port}"

        query = [
            (key, value)
            for key, value in parse_qsl(
                parsed.query, keep_blank_values=True
            )
            if key.casefold() not in TRACKING_PARAMETERS
            and not key.casefold().startswith(TRACKING_PREFIXES)
        ]

        path = parsed.path.rstrip("/") or "/"

        return urlunsplit(
            (scheme, netloc, path, urlencode(query, doseq=True), "")
        )

    except (TypeError, ValueError):
        return ""


def valid_source_url(url, model=None):
    try:
        if not isinstance(url, str):
            return False

        parsed = urlsplit(url)
        hostname = (parsed.hostname or "").lower().removeprefix("www.")

        if (
            parsed.scheme.lower() not in {"http", "https"}
            or not hostname
            or "." not in hostname
            or any(char.isspace() for char in parsed.netloc)
            or parsed.username is not None
            or parsed.password is not None
        ):
            return False

        try:
            parsed.port
        except ValueError:
            return False

        # Reject social media, shorteners, and all other unapproved hosts.
        if model is not None:
            allowed_domains = ALLOWED_DOMAINS.get(model, set())

            if not any(
                hostname == domain or hostname.endswith("." + domain)
                for domain in allowed_domains
            ):
                return False

        return True

    except (TypeError, ValueError):
        return False


def clean_text(value, default="", max_length=None):
    if value is None:
        value = ""

    if not isinstance(value, (str, int, float)):
        value = ""

    value = " ".join(str(value).split()).strip()

    # Don't store placeholders as if they were genuine extracted data.
    if value.casefold() in {
        "not specified",
        "n/a",
        "na",
        "none",
        "null",
        "unknown",
        "not available",
    }:
        value = ""

    if max_length is not None:
        value = value[:max_length]

    return value if value else default


def clean_date(value):
    if isinstance(value, datetime):
        return value.date()

    if isinstance(value, date):
        return value

    if isinstance(value, dict):
        value = (
            value.get("startDate")
            or value.get("endDate")
            or value.get("value")
        )

    if not isinstance(value, str) or not value.strip():
        return None

    value = value.strip()

    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        pass

    formats = (
        "%B %d, %Y",
        "%B %d %Y",
        "%b %d, %Y",
        "%b %d %Y",
        "%d %B %Y",
        "%d %b %Y",
        "%Y/%m/%d",
        "%d/%m/%Y",
        "%m/%d/%Y",
    )

    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue

    try:
        return datetime.fromisoformat(
            value.replace("Z", "+00:00")
        ).date()
    except ValueError:
        return None


def clean_mode(value):
    value = clean_text(value, default="").lower()

    aliases = {
        "virtual": "online",
        "fully online": "online",
        "remote": "online",
        "in person": "offline",
        "in-person": "offline",
        "onsite": "offline",
        "on-site": "offline",
        "both": "hybrid",
        "online/offline": "hybrid",
    }

    value = aliases.get(value, value)

    return value if value in {"online", "offline", "hybrid"} else ""


def build_defaults(result, model):
    title = clean_text(
        result.get("title"), default="", max_length=200
    )

    description = clean_text(
        result.get("description"), default="", max_length=1000
    )

    location = clean_text(
        result.get("location"), default="", max_length=200
    )

    defaults = {
        "title": title,
        "description": description,
        "location": location,
    }

    if model is Internship:
        defaults.update({
            "company": clean_text(
                result.get("company"), default="", max_length=200
            ),
            "skills": clean_text(
                result.get("skills"), default="", max_length=500
            ),
            "stipend": clean_text(
                result.get("stipend"), default="", max_length=100
            ),
            "internship_type": clean_text(
                result.get("internship_type"), default="", max_length=50
            ),
        })

        deadline = clean_date(result.get("deadline"))

        if deadline is not None:
            defaults["deadline"] = deadline

    else:
        defaults.update({
            "organizer": clean_text(
                result.get("organizer"), default="", max_length=200
            ),
            "themes": clean_text(
                result.get("themes"), default="", max_length=500
            ),
            "event_type": clean_text(
                result.get("event_type"), default="", max_length=50
            ),
            "country": clean_text(
                result.get("country"), default="", max_length=100
            ),
        })

        mode = clean_mode(result.get("participation_mode"))

        if mode:
            defaults["participation_mode"] = mode

        for field in (
            "registration_deadline",
            "start_date",
            "end_date",
        ):
            parsed_date = clean_date(result.get(field))

            if parsed_date is not None:
                defaults[field] = parsed_date

    return defaults


def opportunity_is_expired(defaults, model, today):
    if model is Internship:
        deadline = defaults.get("deadline")
        return deadline is not None and deadline < today

    registration_deadline = defaults.get("registration_deadline")
    end_date = defaults.get("end_date")

    return (
        (registration_deadline is not None and registration_deadline < today)
        or (end_date is not None and end_date < today)
    )


def save_opportunities(results, model):
    if model not in (Internship, Hackathon):
        raise ValueError("model must be Internship or Hackathon")

    created_count = 0
    updated_count = 0
    skipped_count = 0

    today = timezone.localdate()
    now = timezone.now()

    text_fields = [
        "title",
        "description",
        "location",
    ]

    date_fields = (
        ["deadline"]
        if model is Internship
        else ["registration_deadline", "start_date", "end_date"]
    )

    if model is Internship:
        text_fields.extend([
            "company",
            "skills",
            "stipend",
            "internship_type",
        ])
    else:
        text_fields.extend([
            "organizer",
            "themes",
            "event_type",
            "country",
        ])

    with transaction.atomic():
        for result in results:
            if not isinstance(result, dict):
                skipped_count += 1
                continue

            raw_url = result.get("source_url")

            # Validate before and after normalization.
            if not isinstance(raw_url, str) or not valid_source_url(
                raw_url, model
            ):
                skipped_count += 1
                continue

            url = normalize_source_url(raw_url)

            if not url or not valid_source_url(url, model):
                skipped_count += 1
                continue

            if len(url) > model._meta.get_field("source_url").max_length:
                skipped_count += 1
                continue

            defaults = build_defaults(result, model)

            if not defaults["title"]:
                skipped_count += 1
                continue

            expired = opportunity_is_expired(defaults, model, today)

            if expired:
                defaults["status"] = model.Status.EXPIRED
                defaults["expired_at"] = now

            opportunity, created = model.objects.get_or_create(
                source_url=url,
                defaults=defaults,
            )

            if created:
                created_count += 1
                continue

            changed_fields = []

            opportunity.last_seen_at = now
            changed_fields.append("last_seen_at")

            # Update only when the newly extracted value is useful.
            for field in text_fields:
                value = defaults.get(field)

                if not value:
                    continue

                if getattr(opportunity, field) != value:
                    setattr(opportunity, field, value)
                    changed_fields.append(field)

            for field in date_fields:
                value = defaults.get(field)

                if value is not None and getattr(opportunity, field) != value:
                    setattr(opportunity, field, value)
                    changed_fields.append(field)

            # Update only a validated participation mode.
            if model is Hackathon and "participation_mode" in defaults:
                value = defaults["participation_mode"]

                if opportunity.participation_mode != value:
                    opportunity.participation_mode = value
                    changed_fields.append("participation_mode")

            # Never reopen a manually closed opportunity.
            if opportunity.status != model.Status.CLOSED:
                if expired:
                    if opportunity.status != model.Status.EXPIRED:
                        opportunity.status = model.Status.EXPIRED
                        changed_fields.append("status")

                    if opportunity.expired_at is None:
                        opportunity.expired_at = now
                        changed_fields.append("expired_at")

                else:
                    has_fresh_date = any(
                        field in defaults for field in date_fields
                    )

                    if (
                        opportunity.status == model.Status.EXPIRED
                        and has_fresh_date
                    ):
                        opportunity.status = model.Status.ACTIVE
                        opportunity.expired_at = None
                        changed_fields.extend(["status", "expired_at"])

            if changed_fields:
                opportunity.save(
                    update_fields=list(dict.fromkeys(changed_fields))
                )

            updated_count += 1

    return {
        "created": created_count,
        "updated": updated_count,
        "skipped": skipped_count,
    }


def save_internships(results):
    return save_opportunities(results, Internship)


def save_hackathons(results):
    return save_opportunities(results, Hackathon)
from datetime import date, datetime
from urllib.parse import urldefrag, urlparse

from django.db import transaction
from django.utils import timezone

from internships.models import Internship
from hackathons.models import Hackathon


def normalize_source_url(url):
    if not url:
        return ""
    return urldefrag(str(url).strip())[0].rstrip("/")


def valid_source_url(url):
    try:
        parsed = urlparse(url)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except (ValueError, TypeError):
        return False


def clean_text(value, default="Not specified", max_length=None):
    if value is None:
        value = ""
    value = str(value).strip()
    if not value:
        value = default
    if max_length is not None:
        value = value[:max_length]
    return value


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

    if not value:
        return None

    value = str(value).strip()
    if not value:
        return None

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


def save_opportunities(results, model):
    if model not in (Internship, Hackathon):
        raise ValueError("model must be Internship or Hackathon")

    created_count = 0
    updated_count = 0
    skipped_count = 0
    today = timezone.localdate()

    with transaction.atomic():
        for result in results:
            url = normalize_source_url(result.get("source_url", ""))
            title = clean_text(
                result.get("title"),
                default="",
                max_length=200,
            )

            if (
                not title
                or not valid_source_url(url)
                or len(url) > model._meta.get_field("source_url").max_length
            ):
                skipped_count += 1
                continue

            defaults = {
                "title": title,
                "description": clean_text(
                    result.get("description"),
                    max_length=1000,
                ),
                "location": clean_text(
                    result.get("location"),
                    max_length=200,
                ),
            }

            date_fields = (
                ["deadline"]
                if model is Internship
                else ["registration_deadline", "start_date", "end_date"]
            )

            for field in date_fields:
                parsed_date = clean_date(result.get(field))
                if parsed_date is not None:
                    defaults[field] = parsed_date

            if model is Internship:
                defaults.update({
                    "company": clean_text(result.get("company"), max_length=200),
                    "skills": clean_text(result.get("skills"), max_length=500),
                    "stipend": clean_text(result.get("stipend"), max_length=100),
                    "internship_type": clean_text(
                        result.get("internship_type"), max_length=50
                    ),
                })
            else:
                defaults.update({
                    "organizer": clean_text(
                        result.get("organizer"), max_length=200
                    ),
                    "themes": clean_text(
                        result.get("themes"), default="", max_length=500
                    ),
                    "event_type": clean_text(
                        result.get("event_type"), max_length=50
                    ),
                })

                mode = str(
                    result.get("participation_mode") or ""
                ).strip().lower()

                if mode in {"online", "offline", "hybrid"}:
                    defaults["participation_mode"] = mode

            if model is Internship:
                expired = (
                    defaults.get("deadline") is not None
                    and defaults["deadline"] < today
                )
            else:
                expired = (
                    defaults.get("registration_deadline") is not None
                    and defaults["registration_deadline"] < today
                ) or (
                    defaults.get("end_date") is not None
                    and defaults["end_date"] < today
                )

            if expired:
                defaults["status"] = model.Status.EXPIRED
                defaults["expired_at"] = timezone.now()

            opportunity, created = model.objects.get_or_create(
                source_url=url,
                defaults=defaults,
            )

            if created:
                created_count += 1
                continue

            changed_fields = []
            opportunity.last_seen_at = timezone.now()
            changed_fields.append("last_seen_at")

            for field in ("title", "description"):
                value = defaults.get(field)
                if value and value != getattr(opportunity, field):
                    setattr(opportunity, field, value)
                    changed_fields.append(field)

            optional_fields = (
                ["company", "location", "skills", "stipend", "internship_type"]
                if model is Internship
                else [
                    "organizer",
                    "location",
                    "themes",
                    "event_type",
                    "participation_mode",
                ]
            )

            for field in optional_fields:
                value = defaults.get(field)

                if value is None or not str(value).strip():
                    continue
                if value == "Not specified":
                    continue

                if getattr(opportunity, field) != value:
                    setattr(opportunity, field, value)
                    changed_fields.append(field)

            for field in date_fields:
                value = defaults.get(field)

                if value is not None and getattr(opportunity, field) != value:
                    setattr(opportunity, field, value)
                    changed_fields.append(field)

            if expired and opportunity.status != model.Status.CLOSED:
                if opportunity.status != model.Status.EXPIRED:
                    opportunity.status = model.Status.EXPIRED
                    changed_fields.append("status")

                if opportunity.expired_at is None:
                    opportunity.expired_at = timezone.now()
                    changed_fields.append("expired_at")

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

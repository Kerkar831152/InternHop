
from urllib.parse import urldefrag, urlparse

from django.db import transaction
from django.utils import timezone

from internships.models import Internship
from hackathons.models import Hackathon


def normalize_source_url(url):
    """Normalize URLs for consistent duplicate detection."""
    if not url:
        return ""

    return urldefrag(url.strip())[0].rstrip("/")


def valid_source_url(url):
    """Accept absolute HTTP and HTTPS URLs."""
    try:
        parsed = urlparse(url)

        return (
            parsed.scheme in ("http", "https")
            and bool(parsed.netloc)
        )
    except ValueError:
        return False


def clean_text(value, default="Not specified", max_length=None):
    """Clean a value and respect the model field's maximum length."""
    value = str(value or "").strip()

    if not value:
        value = default

    if max_length is not None:
        value = value[:max_length]

    return value


def save_opportunities(results, model):
    """
    Save discovered opportunities to the shared database.

    New URLs create records. Existing URLs update only fields
    that discovery actually provides.

    User bookmarks and dismissals are managed separately.
    """
    if model not in (Internship, Hackathon):
        raise ValueError(
            "model must be Internship or Hackathon"
        )

    created_count = 0
    updated_count = 0
    skipped_count = 0

    with transaction.atomic():
        for result in results:
            url = normalize_source_url(
                result.get("source_url", "")
            )

            title = clean_text(
                result.get("title"),
                default="",
                max_length=200,
            )

            description = clean_text(
                result.get("description"),
                default="",
                max_length=1000,
            )

            if (
                not title
                or not valid_source_url(url)
                or len(url) > model._meta.get_field(
                    "source_url"
                ).max_length
            ):
                skipped_count += 1
                continue

            defaults = {
                "title": title,
                "description": description,
                "location": clean_text(
                    result.get("location"),
                    max_length=200,
                ),
                "status": model.Status.ACTIVE,
            }

            if model is Internship:
                defaults.update({
                    "company": clean_text(
                        result.get("company"),
                        max_length=200,
                    ),
                    "skills": clean_text(
                        result.get("skills"),
                        max_length=500,
                    ),
                    "stipend": clean_text(
                        result.get("stipend"),
                        max_length=100,
                    ),
                    "internship_type": clean_text(
                        result.get("internship_type"),
                        max_length=50,
                    ),
                })

            else:
                defaults.update({
                    "organizer": clean_text(
                        result.get("organizer"),
                        max_length=200,
                    ),
                    "themes": clean_text(
                        result.get("themes"),
                        default="",
                        max_length=500,
                    ),
                    "event_type": clean_text(
                        result.get("event_type"),
                        max_length=50,
                    ),
                })

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

            if title and title != opportunity.title:
                opportunity.title = title
                changed_fields.append("title")

            if description and description != opportunity.description:
                opportunity.description = description
                changed_fields.append("description")

            
            optional_fields = (
                ["company", "location", "skills", "stipend",
                 "internship_type"]
                if model is Internship
                else ["organizer", "location", "themes",
                      "event_type"]
            )

            for field in optional_fields:
                value = result.get(field)

                if value is None or not str(value).strip():
                    continue

                max_length = model._meta.get_field(
                    field
                ).max_length

                value = clean_text(
                    value,
                    default="",
                    max_length=max_length,
                )

                if value and getattr(opportunity, field) != value:
                    setattr(opportunity, field, value)
                    changed_fields.append(field)

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
    """Persist discovered internships."""
    return save_opportunities(results, Internship)


def save_hackathons(results):
    """Persist discovered hackathons."""
    return save_opportunities(results, Hackathon)

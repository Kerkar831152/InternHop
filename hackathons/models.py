
from django.db import models


class Hackathon(models.Model):

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        EXPIRED = "expired", "Expired"
        CLOSED = "closed", "Closed"

    class WorkMode(models.TextChoices):
        ONLINE = "online", "Online"
        OFFLINE = "offline", "Offline"
        HYBRID = "hybrid", "Hybrid"
        UNKNOWN = "unknown", "Unknown"

    title = models.CharField(max_length=200)
    organizer = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    description = models.TextField(max_length=1000)
    themes = models.TextField(max_length=500, blank=True)
    event_type = models.CharField(max_length=50)

    participation_mode = models.CharField(
        max_length=10,
        choices=WorkMode.choices,
        default=WorkMode.UNKNOWN,
    )
    registration_deadline = models.DateField(
        null=True,
        blank=True,
    )

    start_date = models.DateField(
        null=True,
        blank=True,
    )

    end_date = models.DateField(
        null=True,
        blank=True,
    )

    source_url = models.URLField(max_length=500)

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_seen_at = models.DateTimeField(auto_now_add=True)
    expired_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.title

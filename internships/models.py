
from django.db import models


class Internship(models.Model):

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        EXPIRED = "expired", "Expired"
        CLOSED = "closed", "Closed"

    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    description = models.TextField(max_length=1000)
    skills = models.TextField(max_length=500)
    stipend = models.CharField(max_length=100)
    internship_type = models.CharField(max_length=50)
    deadline = models.DateField(null=True, blank=True)
    source_url = models.URLField(max_length=200)

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_seen_at = models.DateTimeField(auto_now_add=True)
    expired_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} at {self.company}"

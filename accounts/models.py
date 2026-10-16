
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models
from django.db.models import Q


class User(AbstractUser):
    pass


class SavedOpportunity(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_opportunities",
    )

    internship = models.ForeignKey(
        "internships.Internship",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="saved_by_users",
    )

    hackathon = models.ForeignKey(
        "hackathons.Hackathon",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="saved_by_users",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(internship__isnull=False, hackathon__isnull=True)
                    | Q(internship__isnull=True, hackathon__isnull=False)
                ),
                name="saved_opportunity_exactly_one_type",
            ),
            models.UniqueConstraint(
                fields=["user", "internship"],
                condition=Q(internship__isnull=False),
                name="unique_saved_internship_per_user",
            ),
            models.UniqueConstraint(
                fields=["user", "hackathon"],
                condition=Q(hackathon__isnull=False),
                name="unique_saved_hackathon_per_user",
            ),
        ]

    def __str__(self):
        opportunity = self.internship or self.hackathon
        return f"{self.user.username} - {opportunity}"

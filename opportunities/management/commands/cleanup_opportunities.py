
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from internships.models import Internship
from hackathons.models import Hackathon


class Command(BaseCommand):
    help = "Expire outdated opportunities and delete expired records after 10 days."

    def handle(self, *args, **options):
        today = timezone.localdate()
        now = timezone.now()
        retention_cutoff = now - timedelta(days=30)

        internship_count = Internship.objects.filter(
            status=Internship.Status.ACTIVE,
            deadline__lt=today,
        ).update(
            status=Internship.Status.EXPIRED,
            expired_at=now,
        )

        hackathon_count = Hackathon.objects.filter(
            status=Hackathon.Status.ACTIVE,
        ).filter(
            Q(registration_deadline__lt=today)
            | Q(
                registration_deadline__isnull=True,
                end_date__lt=today,
            )
        ).update(
            status=Hackathon.Status.EXPIRED,
            expired_at=now,
        )

        Internship.objects.filter(
            status=Internship.Status.EXPIRED,
            expired_at__isnull=True,
        ).update(expired_at=now)

        Hackathon.objects.filter(
            status=Hackathon.Status.EXPIRED,
            expired_at__isnull=True,
        ).update(expired_at=now)

        deleted_internships, _ = Internship.objects.filter(
            status=Internship.Status.EXPIRED,
            expired_at__lte=retention_cutoff,
        ).delete()

        deleted_hackathons, _ = Hackathon.objects.filter(
            status=Hackathon.Status.EXPIRED,
            expired_at__lte=retention_cutoff,
        ).delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Internships newly expired: {internship_count}\n"
                f"Hackathons newly expired: {hackathon_count}\n"
                f"Internship records deleted: {deleted_internships}\n"
                f"Hackathon records deleted: {deleted_hackathons}"
            )
        )

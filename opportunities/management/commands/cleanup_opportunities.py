from datetime import timedelta
from urllib.parse import urlparse

from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from internships.models import Internship
from hackathons.models import Hackathon


GENERIC_HACKATHON_URLS = {
    "devpost.com/hackathons",
    "devfolio.co/hackathons",
    "unstop.com/hackathons",
    "www.hackerearth.com/challenges/hackathon",
    "internshala.com/competitions/hackathons",
    "www.reskilll.com",
    "reskilll.com",
    "skillvalix.com/hackathons",
    "hackindia.org",
}


class Command(BaseCommand):
    help = "Close generic listings and expire outdated opportunities."

    def handle(self, *args, **options):
        today = timezone.localdate()
        now = timezone.now()
        retention_cutoff = now - timedelta(days=30)

        generic_count = 0

        for hackathon in Hackathon.objects.filter(
            status=Hackathon.Status.ACTIVE
        ):
            parsed = urlparse(hackathon.source_url or "")
            hostname = parsed.netloc.lower()
            if hostname.startswith("www."):
                hostname = hostname[4:]

            path = parsed.path.rstrip("/")
            normalized_url = f"{hostname}{path}"

            if normalized_url in GENERIC_HACKATHON_URLS:
                hackathon.status = Hackathon.Status.CLOSED
                hackathon.save(update_fields=["status", "updated_at"])
                generic_count += 1

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
            | Q(end_date__lt=today)
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
                f"Generic hackathon pages closed: {generic_count}\n"
                f"Internships newly expired: {internship_count}\n"
                f"Hackathons newly expired: {hackathon_count}\n"
                f"Internship records deleted: {deleted_internships}\n"
                f"Hackathon records deleted: {deleted_hackathons}"
            )
        )

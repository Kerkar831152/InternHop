from django.core.management.base import BaseCommand, CommandError

from opportunities.services.discovery import (
    discover_hackathons,
    discover_internships,
)


class Command(BaseCommand):
    help = "Search for internship and hackathon opportunities."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=5,
        )

    def handle(self, *args, **options):
        limit = options["limit"]

        if limit < 1:
            raise CommandError("--limit must be at least 1.")

        try:
            internships = discover_internships(limit)
            hackathons = discover_hackathons(limit)
        except (RuntimeError, ValueError) as exc:
            raise CommandError(str(exc)) from exc

        self.stdout.write(
            self.style.SUCCESS(
                f"Internship results: {len(internships)}"
            )
        )

        for result in internships:
            self.stdout.write(f"\n{result['title']}")
            self.stdout.write(result["source_url"])
            self.stdout.write(result["description"])

        self.stdout.write(
            self.style.SUCCESS(
                f"\nHackathon results: {len(hackathons)}"
            )
        )

        for result in hackathons:
            self.stdout.write(f"\n{result['title']}")
            self.stdout.write(result["source_url"])
            self.stdout.write(result["description"])

from django.core.management.base import BaseCommand, CommandError

from opportunities.services.discovery import (
    discover_hackathons,
    discover_internships,
)
from opportunities.services.persistence import (
    save_hackathons,
    save_internships,
)


class Command(BaseCommand):
    help = (
        "Discover internship and hackathon opportunities, "
        "then save valid results to the database."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=5,
            help="Maximum search results requested per query.",
        )

    def handle(self, *args, **options):
        limit = options["limit"]

        if limit < 1:
            raise CommandError("--limit must be at least 1.")

        try:
            self.stdout.write("Discovering internships...")
            internships = discover_internships(num_results=limit)

            self.stdout.write("Discovering hackathons...")
            hackathons = discover_hackathons(num_results=limit)

            internship_stats = save_internships(internships)
            hackathon_stats = save_hackathons(hackathons)

        except (RuntimeError, ValueError) as exc:
            raise CommandError(str(exc)) from exc

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Discovery completed."))

        self.stdout.write(
            f"Internships discovered: {len(internships)}"
        )
        self.stdout.write(
            f"  Created: {internship_stats.get('created', 0)}"
        )
        self.stdout.write(
            f"  Updated: {internship_stats.get('updated', 0)}"
        )
        self.stdout.write(
            f"  Skipped: {internship_stats.get('skipped', 0)}"
        )

        self.stdout.write(
            f"\nHackathons discovered: {len(hackathons)}"
        )
        self.stdout.write(
            f"  Created: {hackathon_stats.get('created', 0)}"
        )
        self.stdout.write(
            f"  Updated: {hackathon_stats.get('updated', 0)}"
        )
        self.stdout.write(
            f"  Skipped: {hackathon_stats.get('skipped', 0)}"
        )

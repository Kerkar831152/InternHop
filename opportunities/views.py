from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from accounts.models import UserProfile
from opportunities.services.recommendations import (
    rank_internships,
    rank_hackathons,
)

from opportunities.services.discovery import (
    discover_internships,
    discover_hackathons,
)
from opportunities.services.persistence import (
    save_internships,
    save_hackathons,
)


class DiscoverOpportunitiesView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        opportunity_type = request.data.get("type", "both")

        if opportunity_type not in (
            "internships",
            "hackathons",
            "both",
        ):
            return Response(
                {
                    "error": (
                        "type must be internships, hackathons, or both"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile = request.data.get("profile")
        if profile is not None and not isinstance(profile, dict):
            return Response(
                {"error": "profile must be an object"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = {}

        try:
            if opportunity_type in ("internships", "both"):
                internships = discover_internships(
                    num_results=5,
                    profile=profile,
                )
                results["internships"] = save_internships(internships)

            if opportunity_type in ("hackathons", "both"):
                hackathons = discover_hackathons(
                    num_results=5,
                    profile=profile,
                )
                results["hackathons"] = save_hackathons(hackathons)

        except Exception:
            return Response(
                {
                    "error": (
                        "Discovery failed. Check the Django terminal "
                        "for the underlying error."
                    ),
                    "saved": results,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "message": "Discovery completed.",
                "results": results,
            },
            status=status.HTTP_200_OK,
        )


class RecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(
            user=request.user
        )

        internships = rank_internships(profile)
        hackathons = rank_hackathons(profile)

        return Response({
            "internships": internships,
            "hackathons": hackathons,
        })
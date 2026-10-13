from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Hackathon
from .serializers import HackathonSerializer

class HackathonListCreateView(generics.ListCreateAPIView):
    serializer_class = HackathonSerializer

    def get_queryset(self):
        queryset = Hackathon.objects.filter(
            status=Hackathon.Status.ACTIVE
        ).order_by("-created_at")

        location = self.request.query_params.get("location")
        event_type = self.request.query_params.get("type")
        participation_mode = self.request.query_params.get(
            "participation_mode"
        )
        search = self.request.query_params.get("search")

        if location:
            queryset = queryset.filter(location__icontains=location)

        if event_type:
            queryset = queryset.filter(event_type__iexact=event_type)

        if participation_mode:
            queryset = queryset.filter(
                participation_mode__iexact=participation_mode
            )

        if search:
            queryset = queryset.filter(title__icontains=search)

        return queryset

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUser()]
        return [AllowAny()]


class HackathonDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HackathonSerializer

    def get_queryset(self):
        return Hackathon.objects.filter(
            status=Hackathon.Status.ACTIVE
        )

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [IsAdminUser()]
        return [AllowAny()]

from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Internship
from .serializers import InternshipSerializer


class InternshipListCreateView(generics.ListCreateAPIView):
    serializer_class = InternshipSerializer

    def get_queryset(self):
        queryset = Internship.objects.filter(
            status=Internship.Status.ACTIVE
        ).order_by("-created_at")

        location = self.request.query_params.get("location")
        internship_type = self.request.query_params.get("type")
        work_mode = self.request.query_params.get("work_mode")
        search = self.request.query_params.get("search")

        if location:
            queryset = queryset.filter(location__icontains=location)

        if internship_type:
            queryset = queryset.filter(
                internship_type__iexact=internship_type
            )

        if work_mode:
            queryset = queryset.filter(work_mode__iexact=work_mode)

        if search:
            queryset = queryset.filter(title__icontains=search)

        return queryset

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUser()]
        return [AllowAny()]


class InternshipDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InternshipSerializer

    def get_queryset(self):
        queryset = Internship.objects.filter(
            status=Internship.Status.ACTIVE
        )

        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return queryset

        return queryset

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [IsAdminUser()]
        return [AllowAny()]

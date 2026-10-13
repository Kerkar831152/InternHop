from django.urls import path

from .views import HackathonListCreateView, HackathonDetailView

urlpatterns = [
    path("", HackathonListCreateView.as_view(), name="hackathon-list"),
    path(
        "<int:pk>/",
        HackathonDetailView.as_view(),
        name="hackathon-detail",
    ),
]

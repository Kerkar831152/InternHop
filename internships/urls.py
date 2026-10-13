from django.urls import path

from .views import InternshipListCreateView, InternshipDetailView

urlpatterns = [
    path("", InternshipListCreateView.as_view(), name="internship-list"),
    path("<int:pk>/", InternshipDetailView.as_view(), name="internship-detail"),
]

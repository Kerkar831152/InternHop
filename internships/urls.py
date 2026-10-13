from django.urls import path
from .views import InternshipListView

urlpatterns = [
    path('',InternshipListView.as_view(),name='internship-list'),
]

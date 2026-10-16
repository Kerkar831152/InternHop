from django.urls import path
from opportunities.views import DiscoverOpportunitiesView

urlpatterns = [
    path(
        "discover/",
        DiscoverOpportunitiesView.as_view(),
        name="discover-opportunities",
    ),
]

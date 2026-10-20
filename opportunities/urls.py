from django.urls import path
from opportunities.views import (
    DiscoverOpportunitiesView,
    RecommendationsView,
)
urlpatterns = [
    path("discover/",DiscoverOpportunitiesView.as_view(),name="discover-opportunities",),
    path("recommendations/",RecommendationsView.as_view(),name="recommendations",),
]

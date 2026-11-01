from django.urls import path
from opportunities.views import (
    DiscoverOpportunitiesView,
    RecommendationsView,
)
from opportunities.views import (
    DiscoverOpportunitiesView,
    RecommendationsView,
    ScanOpportunityImageView,
)

urlpatterns = [
    path("discover/",DiscoverOpportunitiesView.as_view(),name="discover-opportunities",),
    path("recommendations/",RecommendationsView.as_view(),name="recommendations",),
    path("scan-image/",ScanOpportunityImageView.as_view(),name="scan-opportunity-image",),
]

from django.urls import path
from . import views
from . import saved_views

app_name = "accounts"

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("me/", views.current_user, name="current_user"),
    path("csrf/", views.csrf_token, name="csrf_token"),
    path("saved/",saved_views.saved_opportunities,name="saved_opportunities",),
    path("saved/toggle/",saved_views.toggle_saved_opportunity,name="toggle_saved_opportunity",),
]
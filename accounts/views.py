import json

from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_protect
from .models import UserProfile

User = get_user_model()

def parse_json_body(request):
    try:
        return json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None



@require_POST
def register(request):
    data = parse_json_body(request)

    if not isinstance(data, dict):
        return JsonResponse(
            {"error": "Invalid JSON body."},
            status=400,
        )

    username = data.get("username", "")
    email = data.get("email", "")
    password = data.get("password", "")

    if not all(
        isinstance(value, str)
        for value in (username, email, password)
    ):
        return JsonResponse(
            {"error": "All fields must be strings."},
            status=400,
        )

    username = username.strip()
    email = email.strip().lower()

    if not username or not email or not password:
        return JsonResponse(
            {"error": "Username, email, and password are required."},
            status=400,
        )

    if len(username) > 150:
        return JsonResponse(
            {"error": "Username is too long."},
            status=400,
        )

    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse(
            {"error": "Username is already taken."},
            status=409,
        )

    if User.objects.filter(email__iexact=email).exists():
        return JsonResponse(
            {"error": "Email is already registered."},
            status=409,
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )

    return JsonResponse(
        {
            "message": "Account created successfully.",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_staff,
            },
        },
        status=201,
    )


@require_POST
def login_view(request):
    data = parse_json_body(request)

    if not isinstance(data, dict):
        return JsonResponse(
            {"error": "Invalid JSON body."},
            status=400,
        )

    username = data.get("username", "")
    password = data.get("password", "")

    if not isinstance(username, str) or not isinstance(password, str):
        return JsonResponse(
            {"error": "Username and password must be strings."},
            status=400,
        )

    username = username.strip()

    if not username or not password:
        return JsonResponse(
            {"error": "Username and password are required."},
            status=400,
        )

    user = authenticate(
        request,
        username=username,
        password=password,
    )

    if user is None:
        return JsonResponse(
            {"error": "Invalid username or password."},
            status=401,
        )

    login(request, user)

    return JsonResponse(
        {
            "message": "Login successful.",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
        },
        status=200,
    )


@require_POST
def logout_view(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "You are not logged in."},
            status=401,
        )

    logout(request)

    return JsonResponse(
        {"message": "Logout successful."},
        status=200,
    )

@require_GET
def current_user(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Authentication required."},
            status=401,
        )

    return JsonResponse(
        {
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "is_admin": request.user.is_staff,
            }
        },
        status=200,
    )

@require_GET
@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({"message": "CSRF cookie set."})


@login_required
@require_GET
def get_profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    return JsonResponse({
        "profile": {
            "degree": profile.degree,
            "study_year": profile.study_year,
            "skills": profile.skills,
            "preferred_roles": profile.preferred_roles,
            "preferred_locations": profile.preferred_locations,
            "work_mode": profile.work_mode,
        }
    })


@login_required
@require_POST
@csrf_protect
def update_profile(request):
    data = parse_json_body(request)

    if not isinstance(data, dict):
        return JsonResponse(
            {"error": "Invalid JSON body."},
            status=400,
        )

    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    fields = {
        "degree": str,
        "study_year": int,
        "skills": list,
        "preferred_roles": list,
        "preferred_locations": list,
        "work_mode": str,
    }

    for field, expected_type in fields.items():
        if field not in data:
            continue

        value = data[field]

        if field == "study_year":
            if isinstance(value, bool) or not isinstance(value, int) or value not in (1, 2, 3, 4, 5, 6):
                return JsonResponse(
                    {"error": "Study year must be between 1 and 6."},
                    status=400,
                )
        elif not isinstance(value, expected_type):
            return JsonResponse(
                {"error": f"Invalid value for {field}."},
                status=400,
            )

        if field in ("skills", "preferred_roles", "preferred_locations"):
            if not all(isinstance(item, str) for item in value):
                return JsonResponse(
                    {"error": f"All items in {field} must be strings."},
                    status=400,
                )
            value = [item.strip() for item in value if item.strip()]

        if field == "work_mode" and value not in ("", "remote", "onsite", "hybrid"):
            return JsonResponse(
                {"error": "Invalid work mode."},
                status=400,
            )

        setattr(profile, field, value)

    profile.save()

    return JsonResponse({
        "message": "Profile updated successfully.",
        "profile": {
            "degree": profile.degree,
            "study_year": profile.study_year,
            "skills": profile.skills,
            "preferred_roles": profile.preferred_roles,
            "preferred_locations": profile.preferred_locations,
            "work_mode": profile.work_mode,
        },
    })

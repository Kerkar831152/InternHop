import json

from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import ensure_csrf_cookie

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
            }
        },
        status=200,
    )

@require_GET
@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({"message": "CSRF cookie set."})
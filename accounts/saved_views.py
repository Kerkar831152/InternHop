
import json

from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required

from .models import SavedOpportunity


@login_required
@require_GET
def saved_opportunities(request):
    saved_items = SavedOpportunity.objects.filter(
        user=request.user
    ).select_related("internship", "hackathon")

    results = []

    for item in saved_items:
        if item.internship_id:
            results.append({
                "id": item.id,
                "type": "internship",
                "opportunity_id": item.internship_id,
            })
        elif item.hackathon_id:
            results.append({
                "id": item.id,
                "type": "hackathon",
                "opportunity_id": item.hackathon_id,
            })

    return JsonResponse({"saved_opportunities": results})


@login_required
@require_POST
@csrf_protect
def toggle_saved_opportunity(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"error": "Invalid JSON body."},
            status=400,
        )

    if not isinstance(data, dict):
        return JsonResponse(
            {"error": "Invalid JSON body."},
            status=400,
        )

    opportunity_type = data.get("type")
    opportunity_id = data.get("opportunity_id")

    if opportunity_type not in ("internship", "hackathon"):
        return JsonResponse(
            {"error": "Invalid opportunity type."},
            status=400,
        )

    if (
        isinstance(opportunity_id, bool)
        or not isinstance(opportunity_id, int)
        or opportunity_id <= 0
    ):
        return JsonResponse(
            {"error": "A valid opportunity ID is required."},
            status=400,
        )

    from internships.models import Internship
    from hackathons.models import Hackathon

    if opportunity_type == "internship":
        opportunity = Internship.objects.filter(
            pk=opportunity_id
        ).first()
        field = "internship"
    else:
        opportunity = Hackathon.objects.filter(
            pk=opportunity_id
        ).first()
        field = "hackathon"

    if opportunity is None:
        return JsonResponse(
            {"error": "Opportunity not found."},
            status=404,
        )

    saved_item = SavedOpportunity.objects.filter(
        user=request.user,
        **{field: opportunity},
    ).first()

    if saved_item:
        saved_item.delete()
        return JsonResponse({
            "saved": False,
            "type": opportunity_type,
            "opportunity_id": opportunity_id,
        })

    SavedOpportunity.objects.create(
        user=request.user,
        **{field: opportunity},
    )

    return JsonResponse({
        "saved": True,
        "type": opportunity_type,
        "opportunity_id": opportunity_id,
    }, status=201)

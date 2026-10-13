from rest_framework import serializers

from .models import Internship

class InternshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Internship
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "last_seen_at",
            "expired_at",
        )

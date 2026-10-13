from django.shortcuts import render

from rest_framework.generics import ListAPIView
from .models import Internship
from .serializers import InternshipSerializer


class InternshipListView(ListAPIView):
    queryset = Internship.objects.all()
    serializer_class = InternshipSerializer

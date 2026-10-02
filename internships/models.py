from django.db import models


class Internship(models.Model):
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    description = models.TextField(max_length=1000)
    skills = models.TextField(max_length=500)
    stipend = models.CharField(max_length=100)
    internship_type = models.CharField(max_length=50)
    deadline = models.DateField()
    source_url = models.URLField(max_length=200)

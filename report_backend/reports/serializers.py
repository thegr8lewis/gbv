from rest_framework import serializers
from .models import IncidentReport

class IncidentReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentReport
        fields = '__all__'
        extra_kwargs = {
            'evidence': {'required': False},
            'contact_phone': {'required': False},
            'contact_email': {'required': False},
        }
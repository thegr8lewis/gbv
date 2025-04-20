from rest_framework import serializers
from .models import IncidentReport
from django.conf import settings
from .models import SupportMessage, Update, Event

class EventSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by')


class SupportMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportMessage
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class UpdateSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Update
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'author')


class IncidentReportSerializer(serializers.ModelSerializer):
    evidence_url = serializers.SerializerMethodField()
    
    def get_evidence_url(self, obj):
        if obj.evidence:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.evidence.url)
            return f"{settings.MEDIA_URL}{obj.evidence.name}"
        return None

    class Meta:
        model = IncidentReport
        fields = '__all__'
        extra_kwargs = {
            'evidence': {'required': False},
            'contact_phone': {'required': False},
            'contact_email': {'required': False},
        }
from rest_framework import serializers
from .models import IncidentReport
from django.conf import settings
from .models import SupportMessage, Update, Event
from .models import ContactMessage
from .models import PsychologistProfile
from django.contrib.auth.models import User
from .models import Booking
from django.utils import timezone
from .models import PsychologistAvailability
from .models import PsychologistProfile

from .models import Availability


from .models import PsychologistProfile, PsychologistAvailability, Booking

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PsychologistAvailability
        fields = ['id', 'start', 'end', 'status']

class PsychologistDetailSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    uid = serializers.CharField(source='user.id', read_only=True)
    availability = serializers.SerializerMethodField()

    class Meta:
        model = PsychologistProfile
        fields = [
            'user_id', 'username', 'gender', 'bio', 'specializations',
            'languages', 'phone_number', 'license_number',
            'email', 'uid', 'availability', 'created_at', 'updated_at'
        ]
    
    def get_availability(self, obj):
        # Make sure we're using the correct related name
        availabilities = obj.user.availabilities.all()
        return AvailabilitySerializer(availabilities, many=True).data




class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = '__all__'
        read_only_fields = ('psychologist', 'created_at', 'updated_at')

class AvailabilityBulkSerializer(serializers.Serializer):
    availabilities = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField(),
            allow_empty=False
        ),
        required=True
    )

    def validate(self, data):
        for avail in data['availabilities']:
            if not all(key in avail for key in ['start', 'end', 'status']):
                raise serializers.ValidationError("Each availability must have start, end, and status")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        # First delete all existing availabilities
        Availability.objects.filter(psychologist=user).delete()
        
        # Create new ones
        availabilities = []
        for avail in validated_data['availabilities']:
            availability = Availability(
                psychologist=user,
                start=avail['start'],
                end=avail['end'],
                status=avail['status']
            )
            availabilities.append(availability)
        
        return Availability.objects.bulk_create(availabilities)



# serializers.py
class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('psychologist', 'client', 'created_at', 'updated_at')

    def validate(self, data):
        # Get psychologist from the view's context
        psychologist = self.context.get('psychologist')
        if not psychologist:
            raise serializers.ValidationError("Psychologist not found")

        # Check if slot exists and is available
        availability = Availability.objects.filter(
            psychologist=psychologist,
            start=data['start'],
            end=data['end'],
            status='available'
        ).first()
        
        if not availability:
            raise serializers.ValidationError("This time slot is not available for booking")
            
        # Check for existing bookings in this slot
        existing_booking = Booking.objects.filter(
            psychologist=psychologist,
            start=data['start'],
            end=data['end']
        ).exists()
        
        if existing_booking:
            raise serializers.ValidationError("This time slot is already booked")
            
        return data

# class BookingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Booking
#         fields = '__all__'
#         read_only_fields = ('psychologist', 'created_at', 'updated_at')

class PastBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

class UpcomingBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

class PsychologistProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    uid = serializers.CharField(source='user.id', read_only=True)
    
    class Meta:
        model = PsychologistProfile
        fields = [
            'username', 'gender', 'bio', 'specializations', 
            'languages', 'phone_number', 'license_number',
            'email', 'uid', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        profile, created = PsychologistProfile.objects.update_or_create(
            user=user,
            defaults=validated_data
        )
        return profile

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'title', 'name', 'email', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']

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
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

# reports/serializers.py
from rest_framework import serializers
from .models import UserAuthDetails

# Existing serializers remain unchanged

class UserAuthDetailsSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = UserAuthDetails
        fields = ['email', 'account_status', 'last_login', 'token_created_at', 'failed_login_attempts', 'created_at', 'updated_at']
        read_only_fields = ['last_login', 'token_created_at', 'created_at', 'updated_at']

# Update PsychologistProfileSerializer to include auth details (optional)
class PsychologistProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    uid = serializers.CharField(source='user.id', read_only=True)
    auth_details = UserAuthDetailsSerializer(source='user.auth_details', read_only=True)
    
    class Meta:
        model = PsychologistProfile
        fields = [
            'username', 'gender', 'bio', 'specializations', 
            'languages', 'phone_number', 'license_number',
            'email', 'uid', 'auth_details', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        profile, created = PsychologistProfile.objects.update_or_create(
            user=user,
            defaults=validated_data
        )
        # Create or update UserAuthDetails
        UserAuthDetails.objects.get_or_create(
            user=user,
            defaults={'account_status': 'active'}
        )
        return profile

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
# class BookingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Booking
#         fields = '__all__'
#         read_only_fields = ('psychologist', 'client', 'created_at', 'updated_at')

#     def validate(self, data):
#         # Get psychologist from the view's context
#         psychologist = self.context.get('psychologist')
#         if not psychologist:
#             raise serializers.ValidationError("Psychologist not found")

#         # Check if slot exists and is available
#         availability = Availability.objects.filter(
#             psychologist=psychologist,
#             start=data['start'],
#             end=data['end'],
#             status='available'
#         ).first()
        
#         if not availability:
#             raise serializers.ValidationError("This time slot is not available for booking")
            
#         # Check for existing bookings in this slot
#         existing_booking = Booking.objects.filter(
#             psychologist=psychologist,
#             start=data['start'],
#             end=data['end']
#         ).exists()
        
#         if existing_booking:
#             raise serializers.ValidationError("This time slot is already booked")
            
#         return data

from rest_framework import serializers
from .models import Booking, Availability

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('psychologist', 'client', 'created_at', 'updated_at')

    def validate(self, data):
        psychologist = self.context.get('psychologist')
        if not psychologist:
            raise serializers.ValidationError("Psychologist not found")

        # Validate slot availability
        availability = Availability.objects.filter(
            psychologist=psychologist,
            start=data['start'],
            end=data['end'],
            status='available'
        ).first()
        if not availability:
            raise serializers.ValidationError("This time slot is not available for booking")

        # Check if slot is already booked
        if Booking.objects.filter(
            psychologist=psychologist,
            start=data['start'],
            end=data['end']
        ).exists():
            raise serializers.ValidationError("This time slot is already booked")

        request = self.context.get('request')
        user = request.user if request else None

        # Require client_email or authenticated user email
        client_email = data.get('client_email')
        if (not user or not user.is_authenticated) and not client_email:
            raise serializers.ValidationError("Email is required for anonymous booking")

        return data




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


        # reports/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PsychologistProfile, UserAuthDetails

class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    username = serializers.CharField(max_length=100, required=True)
    password = serializers.CharField(write_only=True, min_length=8, required=True)
    gender = serializers.CharField(max_length=20, allow_blank=True, required=False)
    bio = serializers.CharField(max_length=500, allow_blank=True, required=False)
    specializations = serializers.CharField(max_length=255, allow_blank=True, required=False)
    languages = serializers.ListField(
        child=serializers.CharField(), allow_empty=True, required=False
    )
    phone_number = serializers.CharField(max_length=20, allow_blank=True, required=False)
    license_number = serializers.CharField(max_length=50, allow_blank=True, required=False)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def create(self, validated_data):
        # Create User
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        user.is_active = True  # Activate the account immediately (or set to False for email verification)
        user.save()

        # Create UserAuthDetails
        UserAuthDetails.objects.create(
            user=user,
            account_status='active'  # Set to 'pending' if you want admin approval
        )

        # Create PsychologistProfile
        PsychologistProfile.objects.create(
            user=user,
            username=validated_data['username'],
            gender=validated_data.get('gender'),
            bio=validated_data.get('bio'),
            specializations=validated_data.get('specializations'),
            languages=validated_data.get('languages', []),
            phone_number=validated_data.get('phone_number'),
            license_number=validated_data.get('license_number')
        )

        return user
    
# reports/serializers.py
from rest_framework import serializers
from .models import UserAuthDetails

class UserAuthDetailsSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserAuthDetails
        fields = ['email', 'account_status', 'last_login', 'token_created_at', 'failed_login_attempts', 'created_at', 'updated_at']
        read_only_fields = ['last_login', 'token_created_at', 'created_at', 'updated_at']
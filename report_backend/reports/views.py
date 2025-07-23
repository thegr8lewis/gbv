from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from .models import IncidentReport
from .serializers import IncidentReportSerializer
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import IncidentReport
from rest_framework import generics, status
from django.utils import timezone
import time
from .models import SupportMessage, Update, Event
from .serializers import SupportMessageSerializer, UpdateSerializer, EventSerializer
from rest_framework.decorators import api_view
from django.core.mail import send_mail
from django.conf import settings
from .models import ContactMessage
from .serializers import ContactMessageSerializer
from rest_framework.authentication import TokenAuthentication
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
from dotenv import load_dotenv
import uuid
load_dotenv()

from django.contrib.auth import update_session_auth_hash
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework import generics, permissions
from .models import Booking
from .serializers import BookingSerializer, PastBookingSerializer, UpcomingBookingSerializer
from django.utils import timezone
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Availability
from .serializers import AvailabilitySerializer, AvailabilityBulkSerializer
from .serializers import PsychologistProfileSerializer
from .serializers import PsychologistDetailSerializer
from .models import PsychologistProfile, PsychologistAvailability
from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from django.utils import timezone
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime, timedelta
import pytz

from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime
from .models import PsychologistProfile, PsychologistAvailability, Booking
from .serializers import (
    PsychologistProfileSerializer, 
    PsychologistDetailSerializer, 
    BookingSerializer
)
# reports/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import User
from .models import PsychologistProfile, Availability, Booking
from .serializers import (
    PsychologistProfileSerializer,
    AvailabilitySerializer,
    BookingSerializer,
)

# Existing imports and views (LoginView, RegisterView, UserDetailsView, etc.) remain unchanged

class PsychologistListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        psychologists = PsychologistProfile.objects.all()
        serializer = PsychologistProfileSerializer(psychologists, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PsychologistDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, id, format=None):
        try:
            psychologist = PsychologistProfile.objects.get(id=id)
            serializer = PsychologistProfileSerializer(psychologist)
            data = serializer.data
            # Include availability
            availabilities = Availability.objects.filter(psychologist=psychologist, status='available')
            data['availability'] = AvailabilitySerializer(availabilities, many=True).data
            return Response(data, status=status.HTTP_200_OK)
        except PsychologistProfile.DoesNotExist:
            return Response(
                {'error': 'Psychologist not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class BookingCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, id, format=None):
        try:
            psychologist = PsychologistProfile.objects.get(id=id)
        except PsychologistProfile.DoesNotExist:
            return Response(
                {'error': 'Psychologist not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        data = request.data.copy()
        data['psychologist'] = psychologist.id
        serializer = BookingSerializer(data=data)
        if serializer.is_valid():
            # Verify the selected slot is still available
            try:
                availability = Availability.objects.get(
                    id=serializer.validated_data['availability_id'],
                    status='available'
                )
            except Availability.DoesNotExist:
                return Response(
                    {'error': 'Selected slot is not available'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Mark the availability as booked
            availability.status = 'booked'
            availability.save()

            # Create the booking
            booking = serializer.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# reports/views.py
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import UserAuthDetails
from .serializers import UserAuthDetailsSerializer

# Existing imports and views remain unchanged

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, format=None):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'detail': 'Please provide both email and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            auth_user = authenticate(username=user.username, password=password)
            
            if not auth_user:
                # Increment failed login attempts
                auth_details, created = UserAuthDetails.objects.get_or_create(user=user)
                auth_details.failed_login_attempts += 1
                if auth_details.failed_login_attempts >= 5:
                    auth_details.account_status = 'suspended'
                auth_details.save()
                return Response(
                    {'detail': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not auth_user.is_active:
                return Response(
                    {'detail': 'User account is disabled'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check account status
            try:
                auth_details = UserAuthDetails.objects.get(user=auth_user)
                if auth_details.account_status == 'suspended':
                    return Response(
                        {'detail': 'Account is suspended due to multiple failed login attempts'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except UserAuthDetails.DoesNotExist:
                auth_details = UserAuthDetails.objects.create(user=auth_user, account_status='active')
            
            # Reset failed login attempts and update last login
            auth_details.failed_login_attempts = 0
            auth_details.last_login = timezone.now()
            auth_details.token_created_at = timezone.now()
            auth_details.save()
            
            token, created = Token.objects.get_or_create(user=auth_user)
            
            return Response({
                'token': token.key,
                'user_id': auth_user.pk,
                'email': auth_user.email,
                'is_staff': auth_user.is_staff,
                'account_status': auth_details.account_status
            })
            
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )


# reports/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .serializers import UserRegistrationSerializer

# Existing imports and views remain unchanged

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, format=None):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'email': user.email,
                'is_staff': user.is_staff,
                'account_status': user.auth_details.account_status
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


# reports/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import User
from .models import UserAuthDetails
from .serializers import UserAuthDetailsSerializer

# Existing imports and views (LoginView, RegisterView, etc.) remain unchanged

class UserDetailsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        try:
            auth_details = UserAuthDetails.objects.get(user=user)
            serializer = UserAuthDetailsSerializer(auth_details)
            return Response({
                'user_id': user.pk,
                'email': user.email,
                'username': user.username,
                'is_staff': user.is_staff,
                'account_status': auth_details.account_status,
                **serializer.data
            }, status=status.HTTP_200_OK)
        except UserAuthDetails.DoesNotExist:
            return Response({
                'user_id': user.pk,
                'email': user.email,
                'username': user.username,
                'is_staff': user.is_staff,
                'account_status': 'active'  # Fallback if UserAuthDetails is missing
            }, status=status.HTTP_200_OK)
class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = PsychologistProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        profile, created = PsychologistProfile.objects.get_or_create(
            user=user,
            defaults={'username': user.username}
        )
        # Ensure UserAuthDetails exists
        UserAuthDetails.objects.get_or_create(
            user=user,
            defaults={'account_status': 'active'}
        )
        return profile
    
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

class PsychologistListView(generics.ListAPIView):
    serializer_class = PsychologistProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return PsychologistProfile.objects.all()

class PsychologistDetailView(generics.RetrieveAPIView):
    serializer_class = PsychologistDetailSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_object(self):
        psychologist = get_object_or_404(PsychologistProfile, user_id=self.kwargs['user_id'])
        
        # Get all availabilities for this psychologist
        availabilities = PsychologistAvailability.objects.filter(
            psychologist=psychologist.user
        ).order_by('start')
        
        # Get all bookings for this psychologist to mark which slots are booked
        now = timezone.now()
        bookings = Booking.objects.filter(
            psychologist=psychologist.user,
            end__gte=now  # Only consider future bookings
        )
        
        # Update availability status based on bookings
        for availability in availabilities:
            # Check if this availability slot has been booked
            is_booked = bookings.filter(
                start=availability.start,
                end=availability.end
            ).exists()
            
            if is_booked and availability.status != 'booked':
                availability.status = 'booked'
                availability.save()
            elif not is_booked and availability.status == 'booked':
                availability.status = 'available'
                availability.save()
        
        return psychologist

from django.core.mail import send_mail
from django.conf import settings

from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime
from .models import PsychologistProfile, PsychologistAvailability, Booking
from .serializers import BookingSerializer


# class CreateBookingView(generics.CreateAPIView):
#     serializer_class = BookingSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_serializer_context(self):
#         context = super().get_serializer_context()
#         psychologist_id = self.kwargs.get('user_id')
#         psychologist = get_object_or_404(User, pk=psychologist_id)
#         context['psychologist'] = psychologist
#         return context

#     def perform_create(self, serializer):
#         psychologist_id = self.kwargs.get('user_id')
#         psychologist = get_object_or_404(PsychologistProfile, user_id=psychologist_id)

#          # First validate the slot is available
#         slot = Availability.objects.filter(
#             psychologist=psychologist.user,
#             start=serializer.validated_data['start'],
#             end=serializer.validated_data['end'],
#             status='available'
#         ).first()
        
#         if not slot:
#             raise serializers.ValidationError("This time slot is not available for booking")

#         # Mark slot as booked before creating the booking
#         slot.status = 'booked'
#         slot.save()

#         meet_link = None
#         calendar_event_id = None

#         if psychologist.google_auth_token:
#             try:
#                 creds = Credentials.from_authorized_user_info(psychologist.google_auth_token)
#                 service = build('calendar', 'v3', credentials=creds)

#                 event = {
#                     'summary': f'Therapy Session with {psychologist.username}',
#                     'description': 'Therapy session booked through SafeSpace',
#                     'start': {
#                         'dateTime': serializer.validated_data['start'].isoformat(),
#                         'timeZone': 'UTC',
#                     },
#                     'end': {
#                         'dateTime': serializer.validated_data['end'].isoformat(),
#                         'timeZone': 'UTC',
#                     },
#                     'conferenceData': {
#                         'createRequest': {
#                             'requestId': f'safespace-{datetime.now().timestamp()}',
#                             'conferenceSolutionKey': {
#                                 'type': 'hangoutsMeet'
#                             }
#                         }
#                     },
#                     'attendees': [
#                         {'email': psychologist.user.email},
#                         {'email': self.request.user.email}
#                     ],
#                 }

#                 event = service.events().insert(
#                     calendarId='primary',
#                     body=event,
#                     conferenceDataVersion=1
#                 ).execute()

#                 meet_link = event.get('hangoutLink')
#                 calendar_event_id = event.get('id')

#             except Exception as e:
#                 print(f"Error creating Google Meet: {e}")
#                 # Fallback to a generic meet link if Google Calendar fails
#                 meet_link = f"https://meet.google.com/new"

    
#         booking = serializer.save(
#             psychologist=psychologist.user,
#             client=self.request.user,
#             client_email=self.request.user.email,
#             meet_link=meet_link,
#             calendar_event_id=calendar_event_id
#         )

#         PsychologistAvailability.objects.filter(
#             psychologist=psychologist.user,
#             start=serializer.validated_data['start'],
#             end=serializer.validated_data['end']
#         ).update(status='booked')

#         # Get user's display name - check if user has a profile with username
#         user_display_name = self.request.user.get_full_name()
#         if not user_display_name:
#             # Try to get from user profile if you have one
#             user_display_name = getattr(self.request.user, 'username', 'User')

#         # Prepare context for email template
#         context = {
#             'user_name': user_display_name,
#             'psychologist_name': psychologist.username,  # Use the display username from profile
#             'booking_date': serializer.validated_data['start'].strftime('%Y-%m-%d'),
#             'booking_time': serializer.validated_data['start'].strftime('%H:%M'),
#             'location': 'Online',
#             'session_type': 'Therapy Session',
#             'meet_link': meet_link or 'https://meet.google.com/new',  # Ensure fallback
#             'current_year': datetime.now().year,
#         }

#         subject = 'Your Therapy Session Booking Confirmation'
#         from_email = settings.DEFAULT_FROM_EMAIL
#         recipient_list = [self.request.user.email]

#         plain_message = f"""
# Dear {context['user_name']},

# Your appointment with {context['psychologist_name']} has been successfully booked.

# Date: {context['booking_date']}
# Time: {context['booking_time']}
# Google Meet Link: {context['meet_link']}

# Thank you,
# SafeSpace Team
# """

#         html_message = render_to_string('emails/booking_confirmation.html', context)

#         try:
#             email = EmailMultiAlternatives(subject, plain_message, from_email, recipient_list)
#             email.attach_alternative(html_message, "text/html")
#             email.send()
#             print("Booking confirmation email sent successfully.")
#         except Exception as e:
#             print(f"Failed to send confirmation email: {e}")
            

class CreateBookingView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.AllowAny]  # Allow anonymous booking

    def get_serializer_context(self):
        context = super().get_serializer_context()
        psychologist_id = self.kwargs.get('user_id')
        psychologist = get_object_or_404(PsychologistProfile, user_id=psychologist_id)
        context['psychologist'] = psychologist.user
        return context

    def perform_create(self, serializer):
        psychologist_user = self.get_serializer_context()['psychologist']

        # Validate and fetch slot availability
        slot = Availability.objects.filter(
            psychologist=psychologist_user,
            start=serializer.validated_data['start'],
            end=serializer.validated_data['end'],
            status='available'
        ).first()
        if not slot:
            raise serializers.ValidationError("This time slot is not available for booking")

        # Mark slot as booked
        slot.status = 'booked'
        slot.save()

        request = self.request
        user = request.user if request.user.is_authenticated else None

        # Determine client and client_email for booking
        if user:
            client = user
            client_email = user.email
            client_phone = getattr(user, 'phone', None)  # optional
        else:
            client = None
            client_email = serializer.validated_data.get('client_email')
            client_phone = serializer.validated_data.get('client_phone')

        # Google Meet integration (same as before)
        meet_link = None
        calendar_event_id = None
        psychologist_profile = get_object_or_404(PsychologistProfile, user=psychologist_user)

        if psychologist_profile.google_auth_token:
            try:
                creds = Credentials.from_authorized_user_info(psychologist_profile.google_auth_token)
                service = build('calendar', 'v3', credentials=creds)

                event = {
                    'summary': f'Therapy Session with {psychologist_user.username}',
                    'description': 'Therapy session booked through SafeSpace',
                    'start': {
                        'dateTime': serializer.validated_data['start'].isoformat(),
                        'timeZone': 'UTC',
                    },
                    'end': {
                        'dateTime': serializer.validated_data['end'].isoformat(),
                        'timeZone': 'UTC',
                    },
                    'conferenceData': {
                        'createRequest': {
                            'requestId': f'safespace-{datetime.now().timestamp()}',
                            'conferenceSolutionKey': {
                                'type': 'hangoutsMeet'
                            }
                        }
                    },
                    'attendees': [
                        {'email': psychologist_user.email},
                    ],
                }

                if client_email:
                    event['attendees'].append({'email': client_email})

                event = service.events().insert(
                    calendarId='primary',
                    body=event,
                    conferenceDataVersion=1
                ).execute()

                meet_link = event.get('hangoutLink')
                calendar_event_id = event.get('id')

            except Exception as e:
                print(f"Error creating Google Meet event: {e}")
                meet_link = "https://meet.google.com/new"

        # Save booking
        booking = serializer.save(
            psychologist=psychologist_user,
            client=client,
            client_email=client_email,
            client_phone=client_phone,
            meet_link=meet_link,
            calendar_event_id=calendar_event_id,
        )

        # Send confirmation email to client_email
        user_display_name = client.get_full_name() if client else client_email.split('@')[0]
        context = {
            'user_name': user_display_name,
            'psychologist_name': psychologist_user.username,
            'booking_date': serializer.validated_data['start'].strftime('%Y-%m-%d'),
            'booking_time': serializer.validated_data['start'].strftime('%H:%M'),
            'location': 'Online',
            'session_type': 'Therapy Session',
            'meet_link': meet_link or 'https://meet.google.com/new',
            'current_year': datetime.now().year,
        }

        subject = 'Your Therapy Session Booking Confirmation'
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [client_email]

        plain_message = f"""
Dear {context['user_name']},

Your appointment with {context['psychologist_name']} has been successfully booked.

Date: {context['booking_date']}
Time: {context['booking_time']}
Google Meet Link: {context['meet_link']}

Thank you,
SafeSpace Team
"""

        html_message = render_to_string('emails/booking_confirmation.html', context)

        try:
            email = EmailMultiAlternatives(subject, plain_message, from_email, recipient_list)
            email.attach_alternative(html_message, "text/html")
            email.send()
            print("Booking confirmation email sent successfully.")
        except Exception as e:
            print(f"Failed to send confirmation email: {e}")


class AvailabilityListView(generics.ListCreateAPIView):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Availability.objects.filter(psychologist=self.request.user)

    def perform_create(self, serializer):
        serializer.save(psychologist=self.request.user)

class AvailabilityBulkUpdateView(generics.CreateAPIView):
    serializer_class = AvailabilityBulkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        availabilities = serializer.save()
        return Response({
            'status': 'success',
            'message': f'{len(availabilities)} availabilities updated'
        }, status=status.HTTP_201_CREATED)

class AvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AvailabilitySerializer
    permission_classes = [AllowAny] 

    def get_queryset(self):
        return Availability.objects.filter(psychologist=self.request.user)

class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(psychologist=self.request.user)

    def perform_create(self, serializer):
        serializer.save(psychologist=self.request.user)

class PastBookingsView(generics.ListAPIView):
    serializer_class = PastBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        now = timezone.now()
        return Booking.objects.filter(
            psychologist=self.request.user,
            end__lt=now
        ).order_by('-start')

class UpcomingBookingsView(generics.ListAPIView):
    serializer_class = UpcomingBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        now = timezone.now()
        return Booking.objects.filter(
            psychologist=self.request.user,
            start__gte=now
        ).order_by('start')

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(psychologist=self.request.user)



from rest_framework import generics, permissions
from .models import PsychologistProfile
from .serializers import PsychologistProfileSerializer
from rest_framework.response import Response

class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = PsychologistProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        profile, created = PsychologistProfile.objects.get_or_create(
            user=user,
            defaults={'username': user.username}
        )
        return profile
    
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_credentials(request):
    """
    Update user's email and/or password
    """
    user = request.user
    current_password = request.data.get('current_password')
    new_email = request.data.get('new_email')
    new_password = request.data.get('new_password')

    # Verify current password first
    if not user.check_password(current_password):
        return Response(
            {'detail': 'Current password is incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Update email if provided
    if new_email:
        if User.objects.filter(email=new_email).exclude(pk=user.pk).exists():
            return Response(
                {'detail': 'This email is already in use by another account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.email = new_email

    # Update password if provided
    if new_password:
        if len(new_password) < 8:
            return Response(
                {'detail': 'Password must be at least 8 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(new_password)

    user.save()
    
    # Update session if password changed to prevent logout
    if new_password:
        update_session_auth_hash(request, user)

    return Response(
        {'detail': 'Credentials updated successfully'},
        status=status.HTTP_200_OK
    )

@csrf_exempt
def fetch_instructions(request):
    request_id = str(uuid.uuid4())
    print(f"Request ID: {request_id}")

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(f"Request ID: {request_id}, Incoming request data: {data}")

            category = data.get('category', '').strip()
            if not category:
                return JsonResponse({"error": "Category is required"}, status=400)

            # Gemini API configuration
            GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
            API_KEY = "AIzaSyCxPkcSec_yliywUVaVEGOKf6Woh9zGhY0"
            
            prompt = (
                f"Provide 3-5 concise bullet points for personal safety steps an individual can take during {category}. "
                "Focus on actionable steps for the individual, not organizational policies. "
                "Format the response exactly like this:\n"
                "1. First step\n"
                "2. Second step\n"
                "3. Third step\n"
                "4. Fourth step (if applicable)\n"
                "5. Fifth step (if applicable)"
            )

            try:
                start_time = time.time()
                response = requests.post(
                    f"{GEMINI_API_URL}?key={API_KEY}",
                    json={
                        "contents": [{
                            "parts": [{
                                "text": prompt
                            }]
                        }],
                        "generationConfig": {
                            "temperature": 0.7,
                            "maxOutputTokens": 300
                        }
                    },
                    timeout=30  # 30 second timeout
                )
                processing_time = time.time() - start_time

            except requests.Timeout:
                return JsonResponse(
                    {"error": "The AI model is taking too long to respond. Please try a simpler request."},
                    status=504
                )
            except requests.ConnectionError:
                return JsonResponse(
                    {"error": "Could not connect to AI service. Please try again later."},
                    status=502
                )

            if response.status_code != 200:
                error_msg = response.json().get("error", {}).get("message", "Unexpected API error")
                print(f"Request ID: {request_id}, Gemini API error: {error_msg}")
                return JsonResponse({"error": f"AI service error: {error_msg}"}, status=response.status_code)

            response_data = response.json()
            
            # Extract the generated text from Gemini's response
            try:
                candidates = response_data.get('candidates', [])
                if not candidates:
                    raise ValueError("No candidates in response")
                
                content = candidates[0].get('content', {})
                parts = content.get('parts', [])
                if not parts:
                    raise ValueError("No parts in content")
                
                instructions = parts[0].get('text', '').strip()
                
                # Ensure we only get the bullet points if they exist
                bullet_start = instructions.find("1. ")
                if bullet_start != -1:
                    instructions = instructions[bullet_start:].strip()

                return JsonResponse({
                    "instructions": instructions,
                    "processing_time": processing_time
                })
            except Exception as e:
                return JsonResponse({"error": "Failed to parse AI response"}, status=500)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format in request body"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method. Only POST is allowed."}, status=405)

class ContactMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ContactMessageSerializer
    queryset = ContactMessage.objects.all()
    lookup_field = 'id'


class ContactMessageListView(ListAPIView,):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

@api_view(['POST'])
def contact_message(request):
    """
    Handle contact form submissions
    """
    serializer = ContactMessageSerializer(data=request.data)
    
    if serializer.is_valid():
        # Save the message to the database
        message = serializer.save()
        
        # Send notification email to administrators
        try:
            subject = f"New Contact Form Submission: {message.title}"
            email_body = f"""
A new message has been submitted through the Safe Space contact form:

Name: {message.name}
Email: {message.email}
Subject: {message.title}

Message:
{message.message}

Please review this message in the admin dashboard.
            """
            
            admin_emails = getattr(settings, 'ADMIN_EMAILS', [settings.DEFAULT_FROM_EMAIL])
            
            send_mail(
                subject=subject,
                message=email_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=admin_emails,
                fail_silently=False,
            )
        except Exception as e:
            # Log the error but don't prevent success response to user
            print(f"Email notification failed: {str(e)}")
        
        return Response(
            {"message": "Thank you for contacting Safe Space. Your message has been received and will be reviewed."},
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



import requests
import math
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def nearest_services(request):
    try:
        lat = float(request.GET.get('lat'))
        lng = float(request.GET.get('lng'))
        radius = int(request.GET.get('radius', 5000))  # Default 5km

        overpass_query = f"""
        [out:json];
        (
          node["amenity"="police"](around:{radius},{lat},{lng});
          way["amenity"="police"](around:{radius},{lat},{lng});
          relation["amenity"="police"](around:{radius},{lat},{lng});

          node["amenity"="hospital"](around:{radius},{lat},{lng});
          way["amenity"="hospital"](around:{radius},{lat},{lng});
          relation["amenity"="hospital"](around:{radius},{lat},{lng});

          node["emergency"="hospital"](around:{radius},{lat},{lng});
        );
        out center;
        """

        response = requests.get(
            "https://overpass-api.de/api/interpreter",
            params={'data': overpass_query},
            timeout=10
        )
        response.raise_for_status()

        data = response.json()
        services = {'police': [], 'hospital': []}

        def calculate_distance(lat1, lng1, lat2, lng2):
            R = 6371000
            φ1 = math.radians(lat1)
            φ2 = math.radians(lat2)
            Δφ = math.radians(lat2 - lat1)
            Δλ = math.radians(lng2 - lng1)

            a = math.sin(Δφ / 2)**2 + math.cos(φ1) * math.cos(φ2) * math.sin(Δλ / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return R * c

        for element in data.get('elements', []):
            tags = element.get('tags', {})
            lat_val = element.get('lat', element.get('center', {}).get('lat'))
            lng_val = element.get('lon', element.get('center', {}).get('lon'))
            phone = tags.get('phone', 'N/A')

            if tags.get('amenity') == 'police':
                services['police'].append({
                    'name': tags.get('name', 'Police Station'),
                    'lat': lat_val,
                    'lng': lng_val,
                    'phone': phone,
                    'distance': calculate_distance(lat, lng, lat_val, lng_val)
                })
            elif tags.get('amenity') == 'hospital' or tags.get('emergency') == 'hospital':
                services['hospital'].append({
                    'name': tags.get('name', 'Hospital'),
                    'lat': lat_val,
                    'lng': lng_val,
                    'phone': phone,
                    'distance': calculate_distance(lat, lng, lat_val, lng_val)
                })

        result = {
            'police': min(services['police'], key=lambda x: x['distance']) if services['police'] else None,
            'hospital': min(services['hospital'], key=lambda x: x['distance']) if services['hospital'] else None
        }

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({'error': str(e), 'message': 'Service lookup failed'}, status=500)


class EventListView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = EventSerializer
    
    def get_queryset(self):
        return Event.objects.all().order_by('-date')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EventSerializer
    queryset = Event.objects.all()
    lookup_field = 'id'

class PublicEventListView(generics.ListAPIView):
    serializer_class = EventSerializer
    queryset = Event.objects.filter(date__gte=timezone.now()).order_by('date')


class PublicUpdateListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = UpdateSerializer
    queryset = Update.objects.filter(published=True).order_by('-date')

class SupportMessageListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportMessageSerializer
    queryset = SupportMessage.objects.all().order_by('-created_at')

class SupportMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportMessageSerializer
    queryset = SupportMessage.objects.all()
    lookup_field = 'id'


class UpdateListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateSerializer
    
    def get_queryset(self):
        return Update.objects.all().order_by('-date')
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class UpdateDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateSerializer
    queryset = Update.objects.all()
    lookup_field = 'id'


class ReportsCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get('status', None)
        queryset = IncidentReport.objects.all()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return Response({
            'count': queryset.count()
        })


class AdminDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'name': user.get_full_name() or user.username,
            'email': user.email
        })


class SubmitReportView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request, format=None):
        serializer = IncidentReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListReportsView(ListAPIView):
    queryset = IncidentReport.objects.all()
    serializer_class = IncidentReportSerializer

class UpdateReportStatusView(RetrieveUpdateAPIView):
    queryset = IncidentReport.objects.all()
    serializer_class = IncidentReportSerializer
    lookup_field = 'id'
    
    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    

User = get_user_model()

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, format=None):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'detail': 'Please provide both email and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get user by email
            user = User.objects.get(email=email)
            
            # Authenticate with username (since Django auth uses username by default)
            auth_user = authenticate(username=user.username, password=password)
            
            if not auth_user:
                return Response(
                    {'detail': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not auth_user.is_active:
                return Response(
                    {'detail': 'User account is disabled'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            token, created = Token.objects.get_or_create(user=auth_user)
            
            return Response({
                'token': token.key,
                'user_id': auth_user.pk,
                'email': auth_user.email,
                'is_staff': auth_user.is_staff
            })
            
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
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
from .models import SupportMessage, Update
from django.utils import timezone
import time
from .serializers import SupportMessageSerializer, UpdateSerializer
from .models import SupportMessage, Update, Event
from .serializers import SupportMessageSerializer, UpdateSerializer, EventSerializer
from rest_framework.decorators import api_view
from django.core.mail import send_mail
from django.conf import settings

from .models import ContactMessage
from .serializers import ContactMessageSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.authentication import TokenAuthentication
from rest_framework import generics
from .models import SupportMessage
from .serializers import SupportMessageSerializer

import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
from dotenv import load_dotenv
import uuid


load_dotenv()

import time
import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests

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
    permission_classes = [IsAuthenticated]
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
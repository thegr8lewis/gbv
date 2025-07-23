from django.db import models
from django.core.validators import FileExtensionValidator
from django.contrib.auth import get_user_model

from django.utils import timezone
from django.contrib.auth.models import User
from django.utils import timezone

from django.db import models
from django.contrib.auth.models import User


User = get_user_model()


class PsychologistAvailability(models.Model):
    psychologist = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='availability' 
    )
    start = models.DateTimeField()
    end = models.DateTimeField()
    status = models.CharField(max_length=20, choices=[
        ('available', 'Available'),
        ('booked', 'Booked'),
        ('unavailable', 'Unavailable')
    ], default='available')
    
    class Meta:
        verbose_name_plural = "Psychologist Availabilities"
        ordering = ['start']

# models.py
class Availability(models.Model):
    psychologist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availabilities')
    start = models.DateTimeField()
    end = models.DateTimeField()
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('unavailable', 'Unavailable'),
        ('booked', 'Booked'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Availabilities"
        ordering = ['start']
        unique_together = ('psychologist', 'start', 'end')  # Prevent duplicate slots

    def __str__(self):
        return f"{self.get_status_display()} ({self.start} to {self.end})"


class Booking(models.Model):
    psychologist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_as_psychologist')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_as_client', null=True, blank=True)
    client_email = models.EmailField(blank=True, null=True)
    client_phone = models.CharField(max_length=20, blank=True, null=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    meet_link = models.URLField(blank=True, null=True)
    calendar_event_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start']

    def __str__(self):
        return f"Session with {self.client_email or self.client} at {self.start}"



class PsychologistProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    username = models.CharField(max_length=100)
    gender = models.CharField(max_length=20, blank=True, null=True)
    google_auth_token = models.JSONField(blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    specializations = models.CharField(max_length=255, blank=True, null=True)
    languages = models.JSONField(default=list)  # Storing as list of strings
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    license_number = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username}'s Profile"

class ContactMessage(models.Model):
    title = models.CharField(max_length=200)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name}: {self.title}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"

User = get_user_model()

class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.date}"
    
    class Meta:
        ordering = ['-date']


User = get_user_model()

class SupportMessage(models.Model):
    STATUS_CHOICES = [
        ('unread', 'Unread'),
        ('read', 'Read'),
        ('replied', 'Replied'),
    ]
    
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unread')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Message from {self.name} - {self.subject}"
    
    class Meta:
        ordering = ['-created_at']

class Update(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    date = models.DateField()
    published = models.BooleanField(default=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-date']



class IncidentReport(models.Model):
    CATEGORY_CHOICES = [
        ('Sexual Harassment', 'Sexual Harassment'),
        ('Sexual Assault', 'Sexual Assault'),
        ('Domestic Violence', 'Domestic Violence'),
        ('Stalking', 'Stalking'),
        ('Verbal Abuse', 'Verbal Abuse'),
        ('Emotional Abuse', 'Emotional Abuse'),
        ('Other', 'Other'),
    ]
    
    GENDER_CHOICES = [
        ('female', 'Female'),
        ('male', 'Male'),
        ('other', 'Other'),
    ]
    
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    perpetrator_details = models.TextField(blank=True, null=True)
    anonymous = models.BooleanField(default=False)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    evidence = models.FileField(
        upload_to='evidence/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'pdf'])]
    )
    status = models.CharField(max_length=100, default='New', choices=[
        ('New', 'New'),
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Report #{self.id} - {self.category}"

    class Meta:
        ordering = ['-created_at']





        # reports/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

User = get_user_model()

# Existing models (PsychologistAvailability, Availability, Booking, etc.) remain unchanged

class UserAuthDetails(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='auth_details')
    last_login = models.DateTimeField(null=True, blank=True)
    token_created_at = models.DateTimeField(null=True, blank=True)
    account_status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('pending', 'Pending'),
            ('suspended', 'Suspended'),
        ],
        default='pending'
    )
    failed_login_attempts = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Auth Details for {self.user.email}"

    class Meta:
        verbose_name = "User Authentication Detail"
        verbose_name_plural = "User Authentication Details"
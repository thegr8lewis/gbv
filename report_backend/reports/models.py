from django.db import models
from django.core.validators import FileExtensionValidator
from django.contrib.auth import get_user_model

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
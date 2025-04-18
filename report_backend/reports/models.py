from django.db import models
from django.core.validators import FileExtensionValidator

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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Report #{self.id} - {self.category}"

    class Meta:
        ordering = ['-created_at']
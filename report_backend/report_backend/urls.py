from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

# Import views and classes
from reports import views
from reports.views import (
    SubmitReportView,
    ListReportsView,
    UpdateReportStatusView,
    LoginView,
    AdminDetailsView,
    ReportsCountView,
    SupportMessageListView,
    SupportMessageDetailView,
    UpdateListView,
    UpdateDetailView,
    PublicUpdateListView,
    EventListView,
    EventDetailView,
    PublicEventListView,
    nearest_services,
    ContactMessageListView,
    ContactMessageDetailView,
    fetch_instructions,
    update_credentials,
    ProfileDetailView,
    BookingListCreateView,
    PastBookingsView,
    UpcomingBookingsView,
    BookingDetailView
    , AvailabilityListView,
    AvailabilityBulkUpdateView,
    AvailabilityDetailView
    , PsychologistListView,
    PsychologistDetailView,
    CreateBookingView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Report Endpoints
    path('api/reports/', SubmitReportView.as_view(), name='submit-report'),
    path('api/reports/list/', ListReportsView.as_view(), name='list-reports'),
    path('api/reports/<int:id>/', UpdateReportStatusView.as_view(), name='update-report'),
    path('api/reports/count/', ReportsCountView.as_view(), name='reports-count'),

    # Auth/Admin
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/admin/details/', AdminDetailsView.as_view(), name='admin-details'),

    # Support Messages
    path('api/support-messages/', SupportMessageListView.as_view(), name='support-messages-list'),
    path('api/support-messages/<int:id>/', SupportMessageDetailView.as_view(), name='support-message-detail'),

    # Updates
    path('api/updates/', UpdateListView.as_view(), name='updates-list'),
    path('api/updates/<int:id>/', UpdateDetailView.as_view(), name='update-detail'),
    path('api/public/updates/', PublicUpdateListView.as_view(), name='public-updates-list'),

    # Events
    path('api/events/', EventListView.as_view(), name='events-list'),
    path('api/events/<int:id>/', EventDetailView.as_view(), name='event-detail'),
    path('api/public/events/', PublicEventListView.as_view(), name='public-events-list'),

    # Utilities
    path('api/nearest-services/', nearest_services, name='nearest-services'),
    path('api/contact/', views.contact_message, name='contact_message'),
    path('api/contact-messages/', ContactMessageListView.as_view(), name='contact-messages-list'),
    path('api/contact-messages/<int:id>/', ContactMessageDetailView.as_view(), name='contact-message-detail'),

    path('api/instructions', fetch_instructions),
    path('api/update-credentials/', update_credentials, name='update-credentials'),



    path('api/profile/', ProfileDetailView.as_view(), name='profile-detail'),
    path('api/bookings/', BookingListCreateView.as_view(), name='booking-list'),
    path('api/bookings/past/', PastBookingsView.as_view(), name='past-bookings'),
    path('api/bookings/upcoming/', UpcomingBookingsView.as_view(), name='upcoming-bookings'),
    path('api/bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('api/availabilities/', AvailabilityListView.as_view(), name='availability-list'),
    path('api/availabilities/bulk/', AvailabilityBulkUpdateView.as_view(), name='availability-bulk-update'),
    path('api/availabilities/<int:pk>/', AvailabilityDetailView.as_view(), name='availability-detail'),
    path('api/psychologists/', PsychologistListView.as_view(), name='psychologist-list'),

    path('api/psychologists/<int:user_id>/', PsychologistDetailView.as_view(), name='psychologist-detail'),
    path('api/psychologists/<int:user_id>/bookings/', CreateBookingView.as_view(), name='create-booking'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
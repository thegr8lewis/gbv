
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from reports.views import SubmitReportView, ListReportsView, UpdateReportStatusView,LoginView, AdminDetailsView, ReportsCountView, SupportMessageListView, SupportMessageDetailView, UpdateListView, UpdateDetailView, PublicUpdateListView, EventListView, EventDetailView, PublicEventListView, nearest_services
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports/', SubmitReportView.as_view(), name='submit-report'),
    path('api/reports/list/', ListReportsView.as_view(), name='list-reports'),
    path('api/reports/<int:id>/', UpdateReportStatusView.as_view(), name='update-report'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/admin/details/', AdminDetailsView.as_view(), name='admin-details'),
    path('api/reports/count/', ReportsCountView.as_view(), name='reports-count'),
    path('api/support-messages/', SupportMessageListView.as_view(), name='support-messages-list'),
    path('api/support-messages/<int:id>/', SupportMessageDetailView.as_view(), name='support-message-detail'),
    path('api/updates/', UpdateListView.as_view(), name='updates-list'),
    path('api/updates/<int:id>/', UpdateDetailView.as_view(), name='update-detail'),
    path('api/public/updates/', PublicUpdateListView.as_view(), name='public-updates-list'),
    path('api/events/', EventListView.as_view(), name='events-list'),
    path('api/events/<int:id>/', EventDetailView.as_view(), name='event-detail'),
    path('api/public/events/', PublicEventListView.as_view(), name='public-events-list'),
    path('api/nearest-services/', nearest_services, name='nearest-services'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
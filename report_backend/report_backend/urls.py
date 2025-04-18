
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from reports.views import SubmitReportView, ListReportsView, UpdateReportStatusView,LoginView, AdminDetailsView, ReportsCountView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports/', SubmitReportView.as_view(), name='submit-report'),
    path('api/reports/list/', ListReportsView.as_view(), name='list-reports'),
    path('api/reports/<int:id>/', UpdateReportStatusView.as_view(), name='update-report'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/admin/details/', AdminDetailsView.as_view(), name='admin-details'),
    path('api/reports/count/', ReportsCountView.as_view(), name='reports-count'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
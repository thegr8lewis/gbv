# from django.contrib import admin
# from django.urls import path
# from reports.views import SubmitReportView, ListReportsView

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/reports/', SubmitReportView.as_view(), name='submit-report'),
#     path('api/reports/list/', ListReportsView.as_view(), name='list-reports'),  # 👈 Add this
# ]

# urls.py
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from reports.views import SubmitReportView, ListReportsView, UpdateReportStatusView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports/', SubmitReportView.as_view(), name='submit-report'),
    path('api/reports/list/', ListReportsView.as_view(), name='list-reports'),
    path('api/reports/<int:id>/', UpdateReportStatusView.as_view(), name='update-report'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
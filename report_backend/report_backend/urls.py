from django.contrib import admin
from django.urls import path
from reports.views import SubmitReportView, ListReportsView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports/', SubmitReportView.as_view(), name='submit-report'),
    path('api/reports/list/', ListReportsView.as_view(), name='list-reports'),  # 👈 Add this
]

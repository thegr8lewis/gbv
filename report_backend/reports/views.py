# from rest_framework import status
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from rest_framework.generics import ListAPIView
# from .models import IncidentReport
# from .serializers import IncidentReportSerializer

# # Existing view for submitting reports
# class SubmitReportView(APIView):
#     def post(self, request, format=None):
#         serializer = IncidentReportSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# # New view for fetching reports
# class ListReportsView(ListAPIView):
#     queryset = IncidentReport.objects.all()
#     serializer_class = IncidentReportSerializer

# reports/views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from .models import IncidentReport
from .serializers import IncidentReportSerializer

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
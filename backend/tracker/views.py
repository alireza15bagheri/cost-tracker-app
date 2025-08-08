from rest_framework.viewsets import ModelViewSet
from .models import Period
from .serializers import PeriodSerializer

class PeriodViewSet(ModelViewSet):
    queryset = Period.objects.all()
    serializer_class = PeriodSerializer

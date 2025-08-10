from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeriodViewSet, IncomeViewSet

# Create a router instance to automatically generate URL patterns for the viewsets
router = DefaultRouter()

# Register the Period viewset with a manual basename, since get_queryset is used instead of queryset
router.register(r'periods', PeriodViewSet, basename='period')

# Register the Income viewset with a manual basename for the same reason
router.register(r'incomes', IncomeViewSet, basename='income')

# Include all router-generated endpoints under the / path
urlpatterns = [
    path('', include(router.urls)),
]

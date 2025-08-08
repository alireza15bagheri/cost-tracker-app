from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeriodViewSet  # + other viewsets

router = DefaultRouter()
router.register(r'periods', PeriodViewSet)
# register others...

urlpatterns = [
    path('', include(router.urls)),
]

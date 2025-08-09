from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeriodViewSet, IncomeViewSet  

router = DefaultRouter()
router.register(r'periods', PeriodViewSet)
router.register(r'incomes', IncomeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

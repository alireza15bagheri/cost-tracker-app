from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PeriodViewSet,
    IncomeViewSet,
    BudgetCategoryViewSet,
    BudgetViewSet,
    DailyHouseSpendingViewSet,
    SignupView,
)

router = DefaultRouter()
router.register(r'periods', PeriodViewSet, basename='period')
router.register(r'incomes', IncomeViewSet, basename='income')
router.register(r'categories', BudgetCategoryViewSet, basename='category')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'daily-house-spendings', DailyHouseSpendingViewSet, basename='daily-house-spending')

urlpatterns = [
    path('', include(router.urls)),
    path('signup/', SignupView.as_view(), name='signup'),
]

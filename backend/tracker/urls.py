from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PeriodViewSet,
    IncomeViewSet,
    BudgetCategoryViewSet,
    BudgetViewSet,
    DailyHouseSpendingViewSet
)

# Create a router instance – this will auto‑generate standard CRUD routes for registered ViewSets
router = DefaultRouter()

router.register(r'periods', PeriodViewSet, basename='period')
router.register(r'incomes', IncomeViewSet, basename='income')
# GET/POST/PUT/PATCH/DELETE at /categories/ for the logged-in user's categories
router.register(r'categories', BudgetCategoryViewSet, basename='category')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'daily-house-spendings', DailyHouseSpendingViewSet, basename='daily-house-spending')

# Include all the automatically-generated routes
urlpatterns = [
    path('', include(router.urls)),  # All registered routes will be available at /api/<route-name>/
]

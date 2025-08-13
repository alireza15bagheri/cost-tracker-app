from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeriodViewSet, IncomeViewSet, BudgetCategoryViewSet, BudgetViewSet

# Create a router instance – this will look at our registered ViewSets and create standard CRUD routes for them
router = DefaultRouter()


router.register(r'periods', PeriodViewSet, basename='period')
router.register(r'incomes', IncomeViewSet, basename='income')
# This exposes GET/POST/PUT/PATCH/DELETE at /categories/ for the logged-in user's categories
router.register(r'categories', BudgetCategoryViewSet, basename='category')
router.register(r'budgets', BudgetViewSet, basename='budget')

# Include all the automatically-generated routes in the urlpatterns list
urlpatterns = [
    path('', include(router.urls)),  # All registered routes will be available at /api/<route-name>/
]

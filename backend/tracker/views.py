from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Period, Income, Budget, BudgetCategory, DailyHouseSpending
from .serializers import (
    PeriodSerializer, IncomeSerializer, 
    BudgetSerializer, BudgetCategorySerializer, 
    DailyHouseSpendingSerializer
)

# Helper function to validate ownership of related objects
def validate_ownership(obj, user):
    if obj.user != user:
        raise PermissionDenied("This object doesn't belong to you.")

# ViewSet to manage periods tied to the authenticated user
class PeriodViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PeriodSerializer

    def get_queryset(self):
        return Period.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# ViewSet to manage income entries, ensuring nested Period is owned
class IncomeViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = IncomeSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Income.objects.filter(user=user)
        period_id = self.request.query_params.get('period')
        if period_id:
            queryset = queryset.filter(period_id=period_id)
        return queryset

    def perform_create(self, serializer):
        period = serializer.validated_data['period']
        validate_ownership(period, self.request.user)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        period = serializer.validated_data.get('period', serializer.instance.period)
        validate_ownership(period, self.request.user)
        serializer.save()

# ViewSet to manage budget categories per user
class BudgetCategoryViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetCategorySerializer

    def get_queryset(self):
        return BudgetCategory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# ViewSet to handle budgets, validating nested Period and Category
class BudgetViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetSerializer

    def get_queryset(self):
        qs = Budget.objects.filter(user=self.request.user)
        period_id = self.request.query_params.get('period')
        if period_id:
            qs = qs.filter(period_id=period_id)
        return qs


    def perform_create(self, serializer):
        period = serializer.validated_data['period']
        category = serializer.validated_data['category']
        validate_ownership(period, self.request.user)
        validate_ownership(category, self.request.user)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        period = serializer.validated_data.get('period', serializer.instance.period)
        category = serializer.validated_data.get('category', serializer.instance.category)
        validate_ownership(period, self.request.user)
        validate_ownership(category, self.request.user)
        serializer.save()

# ViewSet to track daily house spending and validate nested Period
class DailyHouseSpendingViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DailyHouseSpendingSerializer

    def get_queryset(self):
        return DailyHouseSpending.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        period = serializer.validated_data['period']
        validate_ownership(period, self.request.user)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        period = serializer.validated_data.get('period', serializer.instance.period)
        validate_ownership(period, self.request.user)
        serializer.save()

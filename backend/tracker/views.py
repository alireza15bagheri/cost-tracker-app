from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Period, Income, Budget, BudgetCategory, DailyHouseSpending
from .serializers import (
    PeriodSerializer, IncomeSerializer,
    BudgetSerializer, BudgetCategorySerializer,
    DailyHouseSpendingSerializer
)


# Helper: ensure the related object belongs to the current user
def validate_ownership(obj, user):
    if obj.user != user:
        raise PermissionDenied("This object doesn't belong to you.")


# ----- Periods -----
class PeriodViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PeriodSerializer

    def get_queryset(self):
        return Period.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ----- Incomes -----
class IncomeViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = IncomeSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Income.objects.filter(user=user)
        period_id = self.request.query_params.get('period')
        if period_id:
            qs = qs.filter(period_id=period_id)
        return qs

    def perform_create(self, serializer):
        period = serializer.validated_data['period']
        validate_ownership(period, self.request.user)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        period = serializer.validated_data.get('period', serializer.instance.period)
        validate_ownership(period, self.request.user)
        serializer.save()


# ----- Budget Categories -----
class BudgetCategoryViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetCategorySerializer

    def get_queryset(self):
        return BudgetCategory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ----- Budgets -----
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


# ----- Daily House Spendings -----
class DailyHouseSpendingViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DailyHouseSpendingSerializer

    def get_queryset(self):
        qs = DailyHouseSpending.objects.filter(user=self.request.user)
        period_id = self.request.query_params.get('period')
        if period_id:
            qs = qs.filter(period_id=period_id)
        return qs

    def perform_create(self, serializer):
        period = serializer.validated_data['period']
        validate_ownership(period, self.request.user)
        serializer.save()  # user is injected automatically by serializer

    def perform_update(self, serializer):
        period = serializer.validated_data.get('period', serializer.instance.period)
        validate_ownership(period, self.request.user)
        serializer.save()

# /home/alireza/cost-tracker/backend/tracker/views.py
from decimal import Decimal

from django.db import transaction
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

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
    """
    Strategy:
    - READS (list/retrieve): always recompute carryover and remaining_for_day in memory,
      independent of what's stored, to avoid stale values in API responses.
    - WRITES (create/update/delete): save the change, then rectify and persist the correct
      carryover across the entire period so stored data remains consistent for all use cases.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = DailyHouseSpendingSerializer

    # -- Queryset scoping (filter by user and optional period) --
    def get_queryset(self):
        qs = DailyHouseSpending.objects.filter(user=self.request.user)
        period_id = self.request.query_params.get('period')
        if period_id:
            qs = qs.filter(period_id=period_id)
        # Do NOT rely on model Meta ordering (desc); we will explicitly order asc when recomputing.
        return qs

    # -- Core: recompute carryover for a set of rows in ascending date/id order (in-memory) --
    def _recompute_sequence_in_memory(self, queryset):
        """
        Returns a list of model instances with .carryover set to the derived value,
        without persisting. remaining_for_day will serialize correctly because
        the model property uses the (now-updated) in-memory carryover.

        Negative carry is allowed (no clamping) to match your current logic.
        """
        rows = list(queryset.order_by("date", "id"))
        carry = Decimal("0")
        for row in rows:
            # carryover entering this day is whatever we carried from the previous day
            row.carryover = carry
            # Remaining for day (not persisted): used to compute next day's carry
            remaining = row.carryover + row.fixed_daily_limit - row.spent_amount
            carry = remaining  # propagate negatives if overspent
        return rows

    # -- Persisted rectification after any mutation --
    def _rectify_carryovers_in_db(self, period, user):
        """
        Recomputes and saves the carryover for all rows of (user, period) in ascending order.
        Uses a single transaction with bulk_update for efficiency.
        """
        with transaction.atomic():
            rows = list(
                DailyHouseSpending.objects
                .select_for_update()
                .filter(user=user, period=period)
                .order_by("date", "id")
            )
            carry = Decimal("0")
            for row in rows:
                row.carryover = carry
                remaining = row.carryover + row.fixed_daily_limit - row.spent_amount
                carry = remaining
            if rows:
                DailyHouseSpending.objects.bulk_update(rows, ["carryover"])

    # -- READ endpoints: return derived values regardless of what's stored --
    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        rows = self._recompute_sequence_in_memory(qs)
        serializer = self.get_serializer(rows, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Ensure detail view also reflects derived values by recomputing the whole period
        and then picking the requested row with its correct in-memory carryover.
        """
        instance = self.get_object()
        rows = self._recompute_sequence_in_memory(
            DailyHouseSpending.objects.filter(user=request.user, period=instance.period)
        )
        # Find the recomputed instance by id
        by_id = {r.id: r for r in rows}
        corrected = by_id.get(instance.id, instance)
        serializer = self.get_serializer(corrected)
        return Response(serializer.data)

    # -- WRITE endpoints: save, then rectify and persist carryovers across the period --
    def perform_create(self, serializer):
        period = serializer.validated_data['period']
        validate_ownership(period, self.request.user)

        # Save the new row; serializer injects user automatically
        instance = serializer.save()

        # Rectify the entire period so stored data remains consistent
        self._rectify_carryovers_in_db(period=instance.period, user=self.request.user)

    def perform_update(self, serializer):
        period = serializer.validated_data.get('period', serializer.instance.period)
        validate_ownership(period, self.request.user)

        instance = serializer.save()
        self._rectify_carryovers_in_db(period=instance.period, user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        period = instance.period
        user = request.user

        response = super().destroy(request, *args, **kwargs)

        # After deletion, rectify downstream rows in this period
        self._rectify_carryovers_in_db(period=period, user=user)
        return response

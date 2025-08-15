# /home/alireza/cost-tracker/backend/tracker/views.py
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

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
    - READS (list/retrieve): recompute carryover in memory for fresh API responses.
    - WRITES (create/update/delete): save, then rectify carryover across the period.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = DailyHouseSpendingSerializer

    def get_queryset(self):
        qs = DailyHouseSpending.objects.filter(user=self.request.user)
        period_id = self.request.query_params.get('period')
        if period_id:
            qs = qs.filter(period_id=period_id)
        return qs

    def _recompute_sequence_in_memory(self, queryset):
        rows = list(queryset.order_by("date", "id"))
        carry = Decimal("0")
        for row in rows:
            row.carryover = carry
            remaining = row.carryover + row.fixed_daily_limit - row.spent_amount
            carry = remaining
        return rows

    def _rectify_carryovers_in_db(self, period, user):
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

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        rows = self._recompute_sequence_in_memory(qs)
        serializer = self.get_serializer(rows, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        rows = self._recompute_sequence_in_memory(
            DailyHouseSpending.objects.filter(user=request.user, period=instance.period)
        )
        by_id = {r.id: r for r in rows}
        corrected = by_id.get(instance.id, instance)
        serializer = self.get_serializer(corrected)
        return Response(serializer.data)

    def perform_create(self, serializer):
        period = serializer.validated_data['period']
        validate_ownership(period, self.request.user)
        instance = serializer.save()
        if period.default_daily_limit is None:
            period.default_daily_limit = instance.fixed_daily_limit
            period.save(update_fields=['default_daily_limit'])
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
        self._rectify_carryovers_in_db(period=period, user=user)
        return response

# =========================
# Auth: HttpOnly refresh cookie
# =========================

def set_refresh_cookie(response, refresh_token, *, secure: bool, samesite: str = "Lax"):
    """
    Set the refresh token cookie with explicit control over Secure/SameSite.
    """
    max_age = int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=max_age,
        httponly=True,
        secure=secure,
        samesite=samesite,
        path="/api/token/refresh/",
    )
    return response

def clear_refresh_cookie(response):
    response.delete_cookie(key="refresh_token", path="/api/token/refresh/")
    return response

class CookieTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/token/ with {username, password}
    Returns {access} and sets HttpOnly 'refresh_token' cookie.
    """
    def post(self, request, *args, **kwargs):
        res = super().post(request, *args, **kwargs)
        # If authentication failed, preserve SimpleJWT's 401 with its body
        if res.status_code != status.HTTP_200_OK:
            return res
        refresh = res.data.get("refresh")
        access = res.data.get("access")

        # Detect HTTPS, including proxied HTTPS via X-Forwarded-Proto
        xf_proto = request.META.get("HTTP_X_FORWARDED_PROTO", "")
        is_https = request.is_secure() or xf_proto == "https"

        response = Response({"access": access}, status=status.HTTP_200_OK)
        if refresh:
            set_refresh_cookie(response, refresh, secure=is_https, samesite="Lax")
        return response

class CookieTokenRefreshView(TokenRefreshView):
    """
    POST /api/token/refresh/ (no body)
    Reads refresh token from HttpOnly cookie and returns {access}.
    """
    def post(self, request, *args, **kwargs):
        refresh_from_cookie = request.COOKIES.get("refresh_token")
        if not refresh_from_cookie:
            return Response({"detail": "No refresh cookie."}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = self.get_serializer(data={"refresh": refresh_from_cookie})
        serializer.is_valid(raise_exception=True)
        access = serializer.validated_data.get("access")
        return Response({"access": access}, status=status.HTTP_200_OK)

class LogoutView(APIView):
    """
    POST /api/logout/ — clears the refresh cookie.
    """
    permission_classes = []  # allow anonymous; just clears cookie

    def post(self, request):
        response = Response({"detail": "Logged out."}, status=status.HTTP_200_OK)
        clear_refresh_cookie(response)
        return response

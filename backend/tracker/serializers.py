# /home/alireza/cost-tracker/backend/tracker/serializers.py
from rest_framework import serializers
from .models import (
    Period,
    Income,
    Budget,
    BudgetCategory,
    DailyHouseSpending,
)

class PeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Period
        fields = [
            'id', 'name', 'start_date', 'end_date',
            'total_savings',
            'default_daily_limit',  # expose to frontend
        ]
        read_only_fields = ['id', 'total_savings', 'default_daily_limit']

    def validate(self, attrs):
        start = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        if start and end and end < start:
            raise serializers.ValidationError("end_date must be greater than or equal to start_date.")
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# IncomeSerializer: explicit fields, ownership validation, and basic value checks
class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ['id', 'source', 'amount', 'date_received', 'period']
        read_only_fields = ['id']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate_source(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Source cannot be empty.")
        return value

    def validate_period(self, value):
        # Ensure the selected period belongs to the current user
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError("You cannot assign income to another user's period.")
        return value

    def validate(self, attrs):
        # Optionally ensure the income date falls within the selected period
        date_received = attrs.get('date_received', getattr(self.instance, 'date_received', None))
        period = attrs.get('period', getattr(self.instance, 'period', None))
        if date_received and period:
            if not (period.start_date <= date_received <= period.end_date):
                raise serializers.ValidationError("date_received must be within the selected period's date range.")
        return attrs

    def create(self, validated_data):
        # Attach the user from the request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# BudgetCategorySerializer: explicit fields and implicit user assignment
class BudgetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetCategory
        fields = ['id', 'name']
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# BudgetSerializer: accept category_id on input, return nested category on output
class BudgetSerializer(serializers.ModelSerializer):
    # Write: client sends category_id (mapped to model field 'category')
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=BudgetCategory.objects.all(),
        write_only=True,
        source='category',
    )
    # Read: API returns full category object
    category = BudgetCategorySerializer(read_only=True)

    class Meta:
        model = Budget
        fields = ['id', 'period', 'category_id', 'category', 'amount_allocated', 'status', 'due_date']
        read_only_fields = ['id']

    def validate_amount_allocated(self, value):
        if value < 0:
            raise serializers.ValidationError("amount_allocated cannot be negative.")
        return value

    def validate_period(self, value):
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError("You cannot assign a budget to another user's period.")
        return value

    # Keep validation against the resolved model field 'category'
    def validate_category(self, value):
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError("You cannot assign a budget to another user's category.")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class DailyHouseSpendingSerializer(serializers.ModelSerializer):
    # Inject the authenticated user automatically (not supplied by the client)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    # IMPORTANT: make carryover read-only so clients cannot write it.
    # We still include it in output because the ViewSet sets it to the derived value on read.
    carryover = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    # Computed, read-only values (derived from instance.carryover at serialization time)
    remaining_for_day = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_over_limit = serializers.BooleanField(read_only=True)

    class Meta:
        model = DailyHouseSpending
        fields = [
            'id',
            'date',
            'period',
            'user',
            'spent_amount',
            'fixed_daily_limit',
            'carryover',
            'remaining_for_day',
            'is_over_limit',
        ]
        read_only_fields = ['id', 'carryover', 'remaining_for_day', 'is_over_limit']

    def validate_spent_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("spent_amount cannot be negative.")
        return value

    def validate_fixed_daily_limit(self, value):
        if value < 0:
            raise serializers.ValidationError("fixed_daily_limit cannot be negative.")
        return value

    def validate_period(self, value):
        # Ensure period belongs to the requesting user
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError("You cannot record spending against another user's period.")
        return value

    def validate(self, attrs):
        # Ensure the spending date falls within the selected period
        date = attrs.get('date', getattr(self.instance, 'date', None))
        period = attrs.get('period', getattr(self.instance, 'period', None))
        if date and period:
            if not (period.start_date <= date <= period.end_date):
                raise serializers.ValidationError("date must be within the selected period's date range.")
        return attrs

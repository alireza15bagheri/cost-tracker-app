# /home/alireza/cost-tracker/backend/tracker/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Period,
    Income,
    Budget,
    BudgetCategory,
    DailyHouseSpending,
    MiscellaneousCost,
)

User = get_user_model()


class PeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Period
        fields = [
            'id', 'name', 'start_date', 'end_date',
            'total_savings',
            'default_daily_limit',
            'notes',
        ]
        read_only_fields = ['id', 'total_savings']

    def validate(self, attrs):
        start = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        if start and end and end < start:
            raise serializers.ValidationError("end_date must be greater than or equal to start_date.")
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


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
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError("You cannot assign income to another user's period.")
        return value

    def validate(self, attrs):
        date_received = attrs.get('date_received', getattr(self.instance, 'date_received', None))
        period = attrs.get('period', getattr(self.instance, 'period', None))
        if date_received and period:
            if not (period.start_date <= date_received <= period.end_date):
                raise serializers.ValidationError("date_received must be within the selected period's date range.")
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BudgetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetCategory
        fields = ['id', 'name']
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BudgetSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=BudgetCategory.objects.all(),
        write_only=True,
        source='category',
    )
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

    def validate_category(self, value):
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError("You cannot assign a budget to another user's category.")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class DailyHouseSpendingSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    carryover = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
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
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError("You cannot record spending against another user's period.")
        return value

    def validate(self, attrs):
        date = attrs.get('date', getattr(self.instance, 'date', None))
        period = attrs.get('period', getattr(self.instance, 'period', None))
        if date and period:
            if not (period.start_date <= date <= period.end_date):
                raise serializers.ValidationError("date must be within the selected period's date range.")
        return attrs


class MiscellaneousCostSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = MiscellaneousCost
        fields = ['id', 'period', 'user', 'title', 'amount', 'date_added']
        read_only_fields = ['id', 'date_added']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be empty.")
        return value

    def validate_period(self, value):
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError("You cannot add a cost to another user's period.")
        return value


class SignupSerializer(serializers.ModelSerializer):
    # Simple username + password signup
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        read_only_fields = ['id']

    def validate_username(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Username cannot be empty.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value

    def create(self, validated_data):
        username = validated_data['username']
        password = validated_data['password']
        user = User.objects.create_user(username=username, password=password)
        return user
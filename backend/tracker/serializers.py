from rest_framework import serializers
from .models import (
    Period,
    Income,
    Budget,
    BudgetCategory,
    DailyHouseSpending
)


class PeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Period
        fields = '__all__'
        read_only_fields = ['user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


from rest_framework import serializers
from .models import Income

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        # Explicitly list fields to avoid exposing sensitive data 
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
        """Ensure the selected period belongs to the current user."""
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError("You cannot assign income to another user's period.")
        return value

    def create(self, validated_data):
        # Attach the user from the request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BudgetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetCategory
        fields = '__all__'
        read_only_fields = ['user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = ['user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class DailyHouseSpendingSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyHouseSpending
        fields = '__all__'
        read_only_fields = ['user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

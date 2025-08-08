from rest_framework import serializers
from .models import Period, Income, Budget, BudgetCategory, DailyHouseSpending

class PeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Period
        fields = '__all__'

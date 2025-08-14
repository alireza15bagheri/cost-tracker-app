# /home/alireza/cost-tracker/backend/tracker/models.py
from decimal import Decimal
from django.db import models
from django.db.models import Q
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()


class Period(models.Model):
    name = models.CharField(max_length=100)  # e.g. Farvardin 1404
    start_date = models.DateField()
    end_date = models.DateField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_savings = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.name} ({self.start_date} - {self.end_date})"


class Income(models.Model):
    period = models.ForeignKey(Period, on_delete=models.CASCADE, related_name='incomes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    source = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date_received = models.DateField()

    def __str__(self):
        return f"{self.source} - {self.amount}"


class BudgetCategory(models.Model):
    name = models.CharField(max_length=50)  # e.g. House, Loans, Personal
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Budget(models.Model):
    STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('not_paid', 'Not Paid'),
    ]

    period = models.ForeignKey(Period, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(BudgetCategory, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount_allocated = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='not_paid')
    due_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.category.name} - {self.status} (Due: {self.due_date})"


class DailyHouseSpending(models.Model):
    date = models.DateField(db_index=True)
    period = models.ForeignKey(Period, on_delete=models.CASCADE, related_name='daily_spendings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_spendings')
    spent_amount = models.DecimalField(max_digits=12, decimal_places=2)
    fixed_daily_limit = models.DecimalField(max_digits=12, decimal_places=2, default=100)
    carryover = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ["-date", "-id"]
        constraints = [
            models.UniqueConstraint(fields=["user", "period", "date"], name="uniq_user_period_date"),
            models.CheckConstraint(check=Q(spent_amount__gte=0), name="spent_amount_gte_0"),
            models.CheckConstraint(check=Q(fixed_daily_limit__gte=0), name="limit_gte_0"),
        ]
        indexes = [
            models.Index(fields=["user", "period", "date"]),
        ]

    def __str__(self):
        return f"{self.date} spent {self.spent_amount}"

    def clean(self):
        # Make sure the date falls inside the period range
        if self.period.start_date and self.period.end_date:
            if not (self.period.start_date <= self.date <= self.period.end_date):
                raise ValidationError("Spending date must be within the selected period.")

    @property
    def remaining_for_day(self):
        base_carryover = self.carryover if self.carryover is not None else Decimal("0")
        return self.fixed_daily_limit - self.spent_amount + base_carryover


    @property
    def is_over_limit(self):
        return self.remaining_for_day < 0

    def calculate_carryover(self):
        """
        Calculates the next day's carryover based on today's spend.
        """
        return self.fixed_daily_limit + (self.carryover or Decimal("0")) - self.spent_amount

    def save(self, *args, **kwargs):
        # Auto-fill carryover from the previous day in the same period
        if self.carryover is None and self.user_id and self.period_id and self.date:
            prev = (
                DailyHouseSpending.objects
                .filter(user=self.user, period=self.period, date__lt=self.date)
                .order_by("-date", "-id")
                .first()
            )
            self.carryover = prev.remaining_for_day if prev else Decimal("0")
        self.full_clean()
        super().save(*args, **kwargs)

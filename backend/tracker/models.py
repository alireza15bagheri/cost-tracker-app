from django.db import models
from django.contrib.auth.models import User


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
    date = models.DateField()
    period = models.ForeignKey(Period, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    spent_amount = models.DecimalField(max_digits=12, decimal_places=2)
    fixed_daily_limit = models.DecimalField(max_digits=12, decimal_places=2, default=100)
    carryover = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.date} spent {self.spent_amount}"

    def calculate_carryover(self):
        """
        Calculates the balance impact:
        If spent < limit: adds remainder to carryover
        If spent > limit: sets carryover as deficit
        """

        return self.fixed_daily_limit + self.carryover - self.spent_amount

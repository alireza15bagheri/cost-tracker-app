from django.contrib import admin
from .models import Period, Income, BudgetCategory, Budget, DailyHouseSpending, MiscellaneousCost

admin.site.register(Period)
admin.site.register(Income)
admin.site.register(BudgetCategory)
admin.site.register(Budget)
admin.site.register(DailyHouseSpending)
admin.site.register(MiscellaneousCost)
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Period, Income
from .serializers import PeriodSerializer, IncomeSerializer

# ViewSet to handle all CRUD operations for user-specific Income entries
class IncomeViewSet(ModelViewSet):
    # Restrict access to authenticated users only
    permission_classes = [IsAuthenticated]
    serializer_class = IncomeSerializer

    # Limit queryset to incomes owned by the logged-in user
    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    # Automatically assign the logged-in user to the newly created income entry
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ViewSet to manage user-specific budgeting Periods
class PeriodViewSet(ModelViewSet):
    # Ensure that only authenticated users can interact with periods
    permission_classes = [IsAuthenticated]
    serializer_class = PeriodSerializer

    # Return only the periods belonging to the currently logged-in user
    def get_queryset(self):
        return Period.objects.filter(user=self.request.user)

    # Automatically set the user when a new period is created
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

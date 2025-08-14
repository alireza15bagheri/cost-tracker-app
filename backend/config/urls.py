# /home/alireza/cost-tracker/backend/config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Optional: a simple root view for testing backend server availability
def home(request):
    return HttpResponse("Welcome to the Cost Tracker APP Backend 🎯")

# Unified URL patterns: all routes declared here
urlpatterns = [
    path('', home),  # GET http://localhost:8000/ → returns welcome message
    path('admin/', admin.site.urls),  # Django admin interface
    path('api/', include('tracker.urls')),  # Main app endpoints (incomes, periods, etc.)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # JWT access token
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # JWT refresh token
]

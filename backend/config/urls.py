# /home/alireza/cost-tracker/backend/config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from tracker.views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
)

# Optional: a simple root view for testing backend server availability
def home(request):
    return HttpResponse("Welcome to the Cost Tracker APP Backend 🎯")

# Unified URL patterns: all routes declared here
urlpatterns = [
    path('', home),  # GET http://localhost:8000/ → returns welcome message
    path('admin/', admin.site.urls),  # Django admin interface
    path('api/', include('tracker.urls')),  # Main app endpoints (incomes, periods, etc.)

    # Auth endpoints with HttpOnly refresh cookie support
    path('api/token/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
]

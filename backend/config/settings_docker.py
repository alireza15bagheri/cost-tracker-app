# /home/alireza/cost-tracker/backend/config/settings_docker.py
from .settings import *  # noqa
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-insecure")
DEBUG = os.environ.get("DJANGO_DEBUG", "0") == "1"
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db" / "db.sqlite3",
    }
}

STATIC_URL = "/static/"
MEDIA_URL = "/media/"
STATIC_ROOT = "/vol/static"
MEDIA_ROOT = "/vol/media"

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

CORS_ALLOWED_ORIGINS = ["http://localhost", "http://127.0.0.1"]
CORS_ALLOW_CREDENTIALS = True

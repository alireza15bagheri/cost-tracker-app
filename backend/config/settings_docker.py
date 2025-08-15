from .settings import *  # noqa
import os
from pathlib import Path

# Base directory (same as your project root inside the container)
BASE_DIR = Path(__file__).resolve().parent.parent

# Security and debug from environment
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-insecure")
DEBUG = os.environ.get("DJANGO_DEBUG", "0") == "1"
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# SQLite database stored on a mounted volume
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db" / "db.sqlite3",
    }
}

# Static and media (served by Nginx from shared volumes)
STATIC_URL = "/static/"
MEDIA_URL = "/media/"
STATIC_ROOT = "/vol/static"
MEDIA_ROOT = "/vol/media"

# When behind a proxy
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")


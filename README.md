# 💰 Cost Tracker App

A full‑stack **personal finance tracker** built with **Django REST Framework** (backend) and **React + Vite** (frontend).  
It lets you record incomes, budgets, and daily household spendings — with period‑based tracking, notes, and carry‑over calculations — all behind secure JWT authentication.

---

## 🔐 Security Features

- **JWT Auth with HttpOnly Refresh Cookie**  
  - Refresh token stored in an **HttpOnly** cookie to mitigate XSS risks.  
  - Access token held in **memory only**, never persisted to localStorage/sessionStorage.

- **HTTPS Detection for Secure Cookies**  
  - Automatically sets the `Secure` flag when running over HTTPS (direct or via reverse proxy).

- **Per‑User Data Isolation**  
  - Backend validates ownership of resources (periods, incomes, budgets, spendings) before any CRUD operation.

- **CSRF & CORS Protection**  
  - Configurable allowed origins; cookies scoped to API paths only.

- **Database Integrity Rules**  
  - Unique constraints, date range validation, and non‑negative numeric checks at the model level.

---

## 🚀 Deployment on a Fresh Server

1. **Clone the Repo**
   ```bash
   git clone https://github.com/yourusername/cost-tracker.git
   cd cost-tracker

2. **Configure Environment
Copy .env.backend and edit:
DJANGO_SECRET_KEY → generate a strong value
DJANGO_ALLOWED_HOSTS → include your domain/IP
DJANGO_CORS_ALLOWED_ORIGINS → frontend URL
Database URL (SQLite by default, can use Postgres/MySQL)
NOTE: a sample file with notes is included for more clarification .env.backend-sample 

3. **Install Docker & Compose
Ensure Docker and docker compose are available.

4. **Build & Start Containers:

./dev-up.sh --no-cache

docker compose up -d --build

5. **Initialise Backend:
The backend container’s entrypoint runs:
Database migrations
Static file collection
Starts Gunicorn on port 8000

6. **Serve Frontend
The Nginx container serves the built React app and proxies /api/ to Django.

7. **Access the App
Visit http://your-server/ for the UI.
API at http://your-server/api/.
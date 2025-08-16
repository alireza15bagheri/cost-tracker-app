// /home/alireza/cost-tracker/frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import { getAccessToken } from './services/auth';
import { tryRefresh } from './services/auth';

function App() {
  const [bootstrapping, setBootstrapping] = useState(true);

  // One-time cleanup of legacy localStorage key from older builds
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('access_token');
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const token = getAccessToken();
      if (token) {
        if (mounted) setBootstrapping(false);
        return;
      }
      // No token in memory — try silent refresh via HttpOnly cookie
      await tryRefresh();
      if (mounted) setBootstrapping(false);
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  if (bootstrapping) {
    return <div style={{ padding: '2rem' }}>Loading…</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginGate />} />
         <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * LoginGate: If a token exists (in-memory), redirect to /dashboard.
 * Otherwise, show the Login page.
 */
function LoginGate() {
  const token = getAccessToken();
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
}

/**
 * ProtectedRoute: If no token (after bootstrap/refresh attempt), redirect to login.
 * Otherwise, render the protected children.
 */
function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

export default App;
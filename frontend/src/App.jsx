import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginGate />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Catch-all to keep things tidy */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * LoginGate: If a token exists, redirect to /dashboard.
 * Otherwise, show the Login page.
 */
function LoginGate() {
  const token = localStorage.getItem('access_token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
}

/**
 * ProtectedRoute: If no token, redirect to login.
 * Otherwise, render the protected children.
 */
function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

export default App;
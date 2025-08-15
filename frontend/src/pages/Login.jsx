// /home/alireza/cost-tracker/frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { setAccessToken } from '../services/auth';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const { data } = await api.post('token/', {
        username: form.username,
        password: form.password,
      });

      if (!data?.access) {
        setErr('Login failed. No access token received.');
        return;
      }

      setAccessToken(data.access);
      navigate('/dashboard', { replace: true });
      console.log('Navigated to dashboard');
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.non_field_errors?.[0] ||
        'Invalid username or password';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Sign in</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            className="login-input"
            value={form.username}
            onChange={onChange}
            placeholder="Enter your username"
            autoComplete="username"
            required
          />

          <label className="login-label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="login-input"
            value={form.password}
            onChange={onChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {err && <div className="login-error" role="alert">{err}</div>}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="login-hint">Tip: Must use Django user credentials.</p>
      </div>
    </div>
  );
}

// /home/alireza/cost-tracker/frontend/src/pages/Signup.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/account';
import './Login.css';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const onChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    if (!form.username.trim() || !form.password) {
      setErr('Username and password are required.');
      return;
    }
    try {
      setLoading(true);
      await signup({ username: form.username.trim(), password: form.password });
      setOk('Account created. You can now sign in.');
      setTimeout(() => navigate('/', { replace: true }), 600);
    } catch (error) {
      const msg =
        error?.response?.data?.username?.[0] ||
        error?.response?.data?.password?.[0] ||
        error?.response?.data?.detail ||
        'Could not create account.';
      setErr(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Create account</h1>
        <form className="login-form" onSubmit={onSubmit}>
          <label className="login-label" htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            className="login-input"
            value={form.username}
            onChange={onChange}
            placeholder="Choose a username"
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
            placeholder="Choose a password"
            autoComplete="new-password"
            required
          />

          {err && <div className="login-error" role="alert">{err}</div>}
          {ok && <div className="login-hint" role="status" style={{ color: '#9ae6b4' }}>{ok}</div>}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Sign up'}
          </button>
        </form>

        <p className="login-hint" style={{ marginTop: 12 }}>
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

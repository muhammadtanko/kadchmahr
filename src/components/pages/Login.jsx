import { useState } from 'react';
import { useDispatch } from '../../context/AppContext';
import { api, setToken } from '../../api';

export default function Login() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      const payload = await api.post('/users/login', { email: email.trim(), password });
      const user = payload.data ?? payload;
      setToken(user.jwToken, user._id);
      dispatch({ type: 'SET_ME', payload: user._id });
      dispatch({ type: 'SET_LOGGED_IN', payload: true });
    } catch (err) {
      setError(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface)', padding: 'var(--s6)',
    }}>
      <div style={{
        width: 'min(520px, 100%)', background: 'var(--surface-raised)',
        borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md)', padding: '48px 52px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--brand-text)', letterSpacing: '-.02em' }}>KADCHMA</div>
          <div style={{ fontSize: 15, color: 'var(--ink-muted)', marginTop: 6 }}>HR & Finance Portal</div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-muted)' }}>Email address</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@domain.com"
              autoComplete="email"
              required
              style={{ fontSize: 16, padding: '12px 14px', height: 'auto' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-muted)' }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              style={{ fontSize: 16, padding: '12px 14px', height: 'auto' }}
            />
          </label>

          {error && (
            <div style={{
              background: 'var(--danger-subtle, #fee2e2)', color: 'var(--danger, #dc2626)',
              borderRadius: 'var(--r-sm)', padding: '12px 16px', fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn pri"
            disabled={loading || !email.trim() || !password}
            style={{ marginTop: 8, width: '100%', justifyContent: 'center', fontSize: 16, padding: '13px' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

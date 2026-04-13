import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthPanel from './AuthPanel';
import '../styles/Login.css';

const IconGoogle = () => (
  <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

export default function Login() {
  const { login, loading, authError, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [touched, setTouched]   = useState({ email: false, password: false });

  const emailErr = touched.email && email.length > 0 && !email.includes('@')
    ? 'Enter a valid email address' : '';
  const pwdErr = touched.password && password.length > 0 && password.length < 6
    ? 'Password must be at least 6 characters' : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    clearError();
    const result = await login({ email, password });
    if (result.success) navigate('/');
  };

  return (
    <div className="login-page">
      <AuthPanel variant="login" />

      <div className="login-right">
        <div className="login-form-card">

          <p className="login-form__eyebrow">Welcome back</p>
          <h2 className="login-form__title">Sign in</h2>
          <p className="login-form__sub">
            New here? <Link to="/register">Create a free account →</Link>
          </p>

          {authError && (
            <div className="login-error-banner">
              <AlertCircle size={15} className="login-error-banner__icon" />
              <span className="login-error-banner__text">{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <div className="login-field__input-wrap">
                <input
                  id="login-email"
                  type="email"
                  className={`login-field__input${emailErr ? ' error' : ''}`}
                  placeholder="padi@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  autoComplete="email"
                />
              </div>
              {emailErr && (
                <span className="login-field__error">
                  <AlertCircle size={12} /> {emailErr}
                </span>
              )}
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-field__input-wrap">
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className={`login-field__input${pwdErr ? ' error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  autoComplete="current-password"
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  className="login-field__toggle"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {pwdErr && (
                <span className="login-field__error">
                  <AlertCircle size={12} /> {pwdErr}
                </span>
              )}
            </div>

            <Link to="/forgot-password" className="login-forgot">
              Forgot password?
            </Link>

            <button type="submit" className="login-submit" disabled={loading} aria-busy={loading}>
              {loading ? (
                <><span className="login-submit__spinner" aria-hidden="true" /> Signing in…</>
              ) : (
                'Sign in to Wealth Studio'
              )}
            </button>

          </form>

          <div className="login-divider"><span>or continue with</span></div>

          <button className="login-oauth" onClick={() => alert('Google OAuth dont work yet bud. Maybe next submission lol.')}>
            <IconGoogle />
            Continue with Google
          </button>

          <p className="login-register-link">
            Don't have an account? <Link to="/register">Sign up free</Link>
          </p>

          <div className="login-trust">
            <ShieldCheck size={14} className="login-trust__icon" />
            <span className="login-trust__text">
              ABSA NextGen Assignment · Padi Falas-Maifala · Not Affiliated with ABSA Group
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
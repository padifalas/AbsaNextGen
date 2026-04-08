import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";



import { Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';


import { ChartBarIcon } from '@heroicons/react/24/outline';


import SchoolIcon from '@mui/icons-material/School';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet } from '@fortawesome/free-solid-svg-icons';


const IconEye = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3l14 14M8.5 8.5A2.5 2.5 0 0012.5 12.5M6.3 6.3C4.4 7.4 3 10 3 10s3 6 7 6c1.5 0 2.9-.5 4-1.3M10 4c4 0 7 6 7 6s-.7 1.4-2 2.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5L2.5 4v4.5C2.5 11.5 4.9 13.8 8 14.5c3.1-.7 5.5-3 5.5-6V4L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M5.5 8l1.8 1.8 3.2-3.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const IconGoogle = () => (
  <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

const FEATURES = [
//   'SARS 2024/25 PAYE — live, in seconds',
//   'Rent vs buy in Joburg, with real transfer duty',
//   'Strategy tracks for your first five years',
//   'RA tax savings calculator baked in',
];

export default function Login() {
  const { login, loading, authError, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [touched, setTouched]     = useState({ email: false, password: false });

  const emailErr = touched.email && !email.includes('@') && email.length > 0
    ? 'Enter a valid email address'
    : '';
  const pwdErr = touched.password && password.length > 0 && password.length < 6
    ? 'Password must be at least 6 characters'
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    clearError();

    const result = await login({ email, password });
    if (result.success) {
      navigate('/');
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder — wire to your OAuth provider
    alert('Google OAuth — connect your provider here.');
  };

  return (
    <div className="login-page">

  
      <div className="login-left">
        <Link to="/" className="login-brand">
          {/* <div className="login-brand__pill">
            <svg viewBox="0 0 18 18" fill="none">
              <path d="M9 2L3 6v6l6 4 6-4V6L9 2z" fill="white" opacity="0.95"/>
              <path d="M6 9.5l2 2 4-4" stroke="#C1121F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div> */}
          <div className="login-brand__text">
            <span className="login-brand__name">Wealth Studio</span>
            <span className="login-brand__sub">ABSA NextGen</span>
          </div>
        </Link>

        <div className="login-left__hero">
          {/* <h1 className="login-left__tagline">
            Your money.<br />
            <em>Finally clear.</em>
          </h1> */}
          {/* <p className="login-left__body">
            For young South African professionals who earn well but need a framework — not another budgeting app.
          </p> */}
          <div className="login-features">
            {FEATURES.map((f) => (
              <div className="login-feature" key={f}>
                <div className="login-feature__dot" />
                <span className="login-feature__text">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

     {/* right side login input stuff */}
      <div className="login-right">
        <div className="login-form-card">

          <p className="login-form__eyebrow">Welcome back</p>
          <h2 className="login-form__title">Sign in</h2>
          <p className="login-form__sub">
            New here?{' '}
            <Link to="/register">Create a free account →</Link>
          </p>

          {/* Global auth error */}
          {authError && (
            <div className="login-error-banner">
              <IconAlert className="login-error-banner__icon" />
              <span className="login-error-banner__text">{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <div className="login-field__input-wrap">
                <input
                  id="login-email"
                  type="email"
                  className={`login-field__input${emailErr ? ' error' : ''}`}
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  autoComplete="email"
                  aria-describedby={emailErr ? 'email-error' : undefined}
                />
              </div>
              {emailErr && (
                <span className="login-field__error" id="email-error">
                  <IconAlert /> {emailErr}
                </span>
              )}
            </div>

            {/* Password */}
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
                  aria-describedby={pwdErr ? 'pwd-error' : undefined}
                />
                <button
                  type="button"
                  className="login-field__toggle"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {pwdErr && (
                <span className="login-field__error" id="pwd-error">
                  <IconAlert /> {pwdErr}
                </span>
              )}
            </div>

            <Link to="/forgot-password" className="login-forgot">
              Forgot password?
            </Link>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className="login-submit__spinner" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                'Sign in to Wealth Studio'
              )}
            </button>

          </form>

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          <button className="login-oauth" onClick={handleGoogleLogin}>
            <IconGoogle />
            Continue with Google
          </button>

          <p className="login-register-link">
            Don't have an account?{' '}
            <Link to="/register">Sign up free</Link>
          </p>


        </div>
      </div>

    </div>
  );
}

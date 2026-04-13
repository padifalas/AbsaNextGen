import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthPanel from './AuthPanel';
import '../styles/Login.css';
import '../styles/Register.css';

const IconGoogle = () => (
  <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', 'var(--red)', 'var(--gold)', 'var(--gold)', 'var(--sage)'];

export default function Register() {
  const { register, loading, authError, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched]         = useState({});
  const [agreed, setAgreed]           = useState(false);

  const patch  = (field) => (e) => { setForm(p => ({ ...p, [field]: e.target.value })); clearError(); };
  const blur   = (field) => ()  => setTouched(p => ({ ...p, [field]: true }));

  const errs = {
    firstName:       touched.firstName       && !form.firstName.trim()                              ? 'Required' : '',
    lastName:        touched.lastName        && !form.lastName.trim()                               ? 'Required' : '',
    email:           touched.email           && form.email && !form.email.includes('@')             ? 'Enter a valid email address' : '',
    password:        touched.password        && form.password && form.password.length < 6          ? 'At least 6 characters' : '',
    confirmPassword: touched.confirmPassword && form.confirmPassword && form.confirmPassword !== form.password ? 'Passwords do not match' : '',
  };

  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, password: true, confirmPassword: true });
    if (!agreed || Object.values(errs).some(Boolean)) return;
    if (!form.firstName || !form.lastName || !form.email || !form.password) return;
    if (form.password !== form.confirmPassword) return;

    const result = await register({
      firstName: form.firstName,
      lastName:  form.lastName,
      email:     form.email,
      password:  form.password,
    });
    if (result.success) navigate('/onboarding');
  };

  return (
    <div className="login-page">
      <AuthPanel variant="register" />

      <div className="login-right">
        <div className="login-form-card register-form-card">

          <p className="login-form__eyebrow">Get started free</p>
          <h2 className="login-form__title">Create account</h2>
          <p className="login-form__sub">
            Already have one? <Link to="/login">Sign in →</Link>
          </p>

          {authError && (
            <div className="login-error-banner">
              <AlertCircle size={15} className="login-error-banner__icon" />
              <span className="login-error-banner__text">{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            <div className="reg-field-row">
              <div className="login-field">
                <label htmlFor="reg-first">First name</label>
                <input id="reg-first" type="text"
                  className={`login-field__input${errs.firstName ? ' error' : ''}`}
                  placeholder="Andre"
                  value={form.firstName} onChange={patch('firstName')} onBlur={blur('firstName')}
                  autoComplete="given-name" />
                {errs.firstName && <span className="login-field__error"><AlertCircle size={12} /> {errs.firstName}</span>}
              </div>

              <div className="login-field">
                <label htmlFor="reg-last">Last name</label>
                <input id="reg-last" type="text"
                  className={`login-field__input${errs.lastName ? ' error' : ''}`}
                  placeholder="Gopal"
                  value={form.lastName} onChange={patch('lastName')} onBlur={blur('lastName')}
                  autoComplete="family-name" />
                {errs.lastName && <span className="login-field__error"><AlertCircle size={12} /> {errs.lastName}</span>}
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="reg-email">Email address</label>
              <input id="reg-email" type="email"
                className={`login-field__input${errs.email ? ' error' : ''}`}
                placeholder="you@email.com"
                value={form.email} onChange={patch('email')} onBlur={blur('email')}
                autoComplete="email" />
              {errs.email && <span className="login-field__error"><AlertCircle size={12} /> {errs.email}</span>}
            </div>

            <div className="login-field">
              <label htmlFor="reg-password">Password</label>
              <div className="login-field__input-wrap">
                <input id="reg-password"
                  type={showPwd ? 'text' : 'password'}
                  className={`login-field__input${errs.password ? ' error' : ''}`}
                  placeholder="8+ characters"
                  value={form.password} onChange={patch('password')} onBlur={blur('password')}
                  autoComplete="new-password" style={{ paddingRight: '42px' }} />
                <button type="button" className="login-field__toggle"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}>
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="reg-strength">
                  <div className="reg-strength__bars">
                    {[1,2,3,4].map(l => (
                      <div key={l} className="reg-strength__seg"
                        style={{ background: l <= strength ? STRENGTH_COLORS[strength] : 'var(--surface-2)' }} />
                    ))}
                  </div>
                  <span className="reg-strength__label" style={{ color: STRENGTH_COLORS[strength] }}>
                    {STRENGTH_LABELS[strength]}
                  </span>
                </div>
              )}
              {errs.password && <span className="login-field__error"><AlertCircle size={12} /> {errs.password}</span>}
            </div>

            <div className="login-field">
              <label htmlFor="reg-confirm">Confirm password</label>
              <div className="login-field__input-wrap">
                <input id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={`login-field__input${errs.confirmPassword ? ' error' : ''}`}
                  placeholder="Repeat password"
                  value={form.confirmPassword} onChange={patch('confirmPassword')} onBlur={blur('confirmPassword')}
                  autoComplete="new-password" style={{ paddingRight: '42px' }} />
                <button type="button" className="login-field__toggle"
                  onClick={() => setShowConfirm(s => !s)}
                  aria-label={showConfirm ? 'Hide' : 'Show'}>
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errs.confirmPassword && <span className="login-field__error"><AlertCircle size={12} /> {errs.confirmPassword}</span>}
            </div>

            <div className="reg-terms">
              <input type="checkbox" id="reg-terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <label htmlFor="reg-terms">
                I agree to the <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a> and{' '}
                <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>.
                I understand this app uses my salary data to calculate SARS estimates.
              </label>
            </div>
            {touched.confirmPassword && !agreed && (
              <p className="reg-terms-error">You must agree to the terms to continue.</p>
            )}

            <button type="submit" className="login-submit" disabled={loading || !agreed} aria-busy={loading}>
              {loading ? (
                <><span className="login-submit__spinner" aria-hidden="true" /> Creating account…</>
              ) : (
                'Create my account'
              )}
            </button>

          </form>

          <div className="login-divider"><span>or sign up with</span></div>

          <button className="login-oauth" onClick={() => alert('Google OAuth dont work yet bud. Maybe next submission lol.')}>
            <IconGoogle /> Continue with Google
          </button>

          <p className="login-register-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
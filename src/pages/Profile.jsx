import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

const DEFAULT_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  goal: '',
  password: '',
  confirmPassword: '',
};

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('save');
  const [saving, setSaving] = useState(false);

  const profileCompletion = Math.round(
    [user?.firstName, user?.lastName, user?.email, user?.goal].filter(Boolean).length * 25
  );
  const accountInitials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      goal: user.goal || '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setStatus({ type: '', message: '' });
  }, [user]);

  const validate = () => {
    const nextErrors = {};

    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required.';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required.';
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!form.email.includes('@')) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (form.password && form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }
    if (form.password && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    return nextErrors;
  };

  const handleChange = (field) => (event) => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setStatus({ type: 'error', message: 'Please fix the highlighted fields before saving.' });
      return;
    }

    setModalType('save');
    setModalOpen(true);
  };

  const handleReset = () => {
    setModalType('reset');
    setModalOpen(true);
  };

  const confirmAction = async () => {
    setModalOpen(false);
    setStatus({ type: '', message: '' });

    if (modalType === 'reset') {
      if (!user) return;
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        goal: user.goal || '',
        password: '',
        confirmPassword: '',
      });
      setErrors({});
      setStatus({ type: 'success', message: 'Your form now matches the saved account details.' });
      return;
    }

    setSaving(true);
    const nextProfile = {
      ...user,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      goal: form.goal.trim(),
    };
    if (form.password) nextProfile.password = form.password;

    const result = await updateProfile(nextProfile);
    setSaving(false);

    if (result.success) {
      setStatus({ type: 'success', message: 'Profile updates have been saved.' });
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setErrors({});
    } else {
      setStatus({ type: 'error', message: result.error || 'Unable to save your profile updates. Please try again.' });
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card profile-card--empty">
          <h2>Profile not available</h2>
          <p>Sign in again to access profile settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header__intro">
          <div className="profile-eyebrow">Account</div>
          <h1 className="profile-title">Profile settings</h1>
          <p className="profile-subtitle">
            View and edit your account details, update your security and set your personal goal.
          </p>
        </div>
        <div className="profile-header__actions">
          <Link to="/" className="btn-ghost profile-back">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>

      <section className="profile-summary-card">
        <div className="profile-summary-head">
          {user.picture ? (
            <img
              src={user.picture}
              alt="Google Profile"
              className="profile-summary-avatar"
              style={{ objectFit: 'cover', width: '56px', height: '56px', borderRadius: '18px' }}
            />
          ) : (
            <div className="profile-summary-avatar">{accountInitials || 'AB'}</div>
          )}
          <div>
            <p className="profile-summary-label">Current account</p>
            <h2 className="profile-summary-name">{user.firstName} {user.lastName}</h2>
          </div>
        </div>
        <div className="profile-summary-grid">
          <div className="profile-summary-item">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="profile-summary-item">
            <span>Goal</span>
            <strong>{user.goal || 'Goal not set yet'}</strong>
          </div>
          <div className="profile-summary-item">
            <span>Plan type</span>
            <strong>Standard user</strong>
          </div>
          <div className="profile-summary-item profile-summary-item--wide">
            <span>Profile completion</span>
            <strong>{profileCompletion}% complete</strong>
          </div>
        </div>
      </section>

      {status.message && (
        <div className={`profile-alert profile-alert--${status.type}`}>
          {status.message}
        </div>
      )}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-grid">
          <section className="profile-card">
            <div className="profile-card__header">
              <h2>Personal details</h2>
              <p>Keep your name, email and goals up to date.</p>
            </div>
            <div className="profile-field-group">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange('firstName')}
                className={errors.firstName ? 'input-error' : ''}
              />
              {errors.firstName && <span className="field-error">{errors.firstName}</span>}
            </div>
            <div className="profile-field-group">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange('lastName')}
                className={errors.lastName ? 'input-error' : ''}
              />
              {errors.lastName && <span className="field-error">{errors.lastName}</span>}
            </div>
            <div className="profile-field-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="profile-field-group profile-field-group--full">
              <label htmlFor="goal">Primary goal</label>
              <input
                id="goal"
                type="text"
                placeholder="Example: Max TFSA contributions"
                value={form.goal}
                onChange={handleChange('goal')}
              />
            </div>
          </section>

          <section className="profile-card profile-card--accent">
            <div className="profile-card__header">
              <h2>Security</h2>
              <p>Update your password or keep your account protected.</p>
            </div>
            <div className="profile-field-group">
              <label htmlFor="password">New password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                className={errors.password ? 'input-error' : ''}
                placeholder="Leave blank to keep current password"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <div className="profile-field-group">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                className={errors.confirmPassword ? 'input-error' : ''}
                placeholder="Repeat new password"
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>
            <div className="profile-card__note">
              Your email is also used for account recovery and notifications.
            </div>
          </section>
        </div>

        <div className="profile-actions">
          <button type="submit" className="btn-primary profile-save-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button type="button" className="btn-ghost profile-reset-btn" onClick={handleReset}>
            Reset changes
          </button>
        </div>
      </form>

      {modalOpen && (
        <div className="profile-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="profile-modal" onClick={(event) => event.stopPropagation()}>
            <div className="profile-modal__title">
              {modalType === 'save' ? 'Save profile changes?' : 'Reset profile form?'}
            </div>
            <p className="profile-modal__text">
              {modalType === 'save'
                ? 'Confirm to save your updated profile information.'
                : 'Any unsaved edits will be discarded and the form will revert.'}
            </p>
            <div className="profile-modal__actions">
              <button className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmAction}>
                {modalType === 'save' ? 'Confirm save' : 'Discard changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

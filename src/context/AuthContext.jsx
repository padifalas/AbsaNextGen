import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // ask andre if this check localStorage / a token / a backend session.
  // for now wil persist to localStorage so the session survives a page refresh.
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ws_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      const safeUser = { ...parsed };
      delete safeUser.password;
      return safeUser;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const persistUser = (nextUser) => {
    try {
      const stored = localStorage.getItem('ws_user');
      const existing = stored ? JSON.parse(stored) : {};
      const combined = { ...existing, ...nextUser };
      localStorage.setItem('ws_user', JSON.stringify(combined));
      const safeUser = { ...combined };
      delete safeUser.password;
      setUser(safeUser);
    } catch {
      // ignore localStorage failures
      setUser(nextUser);
    }
  };

  const register = async ({ firstName, lastName, email, password }) => {
    setLoading(true);
    setAuthError('');
    try {
      await new Promise((r) => setTimeout(r, 900));
      if (!firstName || !lastName || !email || !password) {
        throw new Error('Please complete all registration fields.');
      }
      if (!email.includes('@')) {
        throw new Error('Enter a valid email address.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      const stored = localStorage.getItem('ws_user');
      if (stored) {
        const existing = JSON.parse(stored);
        if (existing.email === email) {
          throw new Error('An account with this email already exists.');
        }
      }

      const userData = {
        id: 'usr_001',
        firstName,
        lastName,
        email,
        name: `${firstName} ${lastName}`,
        password,
        onboarded: false,
      };

      persistUser(userData);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    setAuthError('');
    try {
      await new Promise((r) => setTimeout(r, 900));
      if (!email || !password) {
        throw new Error('Please fill in both fields.');
      }
      if (!email.includes('@')) {
        throw new Error('Enter a valid email address.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      const stored = localStorage.getItem('ws_user');
      if (!stored) {
        throw new Error('No account found. Please register first.');
      }

      const existing = JSON.parse(stored);
      if (existing.email !== email || existing.password !== password) {
        throw new Error('Incorrect email or password.');
      }

      persistUser(existing);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (profileData) => {
    setLoading(true);
    setAuthError('');
    try {
      if (profileData && profileData.error) {
        throw new Error(profileData.error);
      }
      if (!profileData || !profileData.email) {
        throw new Error('Google Sign-In failed to retrieve user profile.');
      }
      
      const stored = localStorage.getItem('ws_user');
      let googleUser;
      if (stored) {
        try {
          const existing = JSON.parse(stored);
          if (existing.email === profileData.email) {
            googleUser = {
              ...existing,
              firstName: profileData.given_name || existing.firstName,
              lastName: profileData.family_name || existing.lastName,
              name: profileData.name || existing.name,
              picture: profileData.picture || existing.picture,
            };
          }
        } catch {
          // ignore parsing failures
        }
      }

      if (!googleUser) {
        googleUser = {
          id: `usr_${profileData.sub || Math.random().toString(36).substring(2, 11)}`,
          firstName: profileData.given_name || 'Google',
          lastName: profileData.family_name || 'User',
          email: profileData.email,
          name: profileData.name || 'Google User',
          picture: profileData.picture || '',
          onboarded: false,
        };
      }

      persistUser(googleUser);
      return { success: true, onboarded: googleUser.onboarded };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (nextData) => {
    setLoading(true);
    setAuthError('');
    try {
      await new Promise((r) => setTimeout(r, 500));
      persistUser(nextData);
      return { success: true };
    } catch (err) {
      setAuthError(err.message || 'Unable to update profile.');
      return { success: false, error: err.message || 'Unable to update profile.' };
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    setAuthError('');
    try {
      if (!user) {
        throw new Error('Unable to complete onboarding. Please sign in again.');
      }
      persistUser({ ...user, onboarded: true });
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // keep    user data in localStorage so they can log back in without re-registering
    // jus clearin the React state
    setUser(null);
    setAuthError('');
  };

  const clearError = () => setAuthError('');

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, updateProfile, completeOnboarding, logout, loading, authError, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

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
    <AuthContext.Provider value={{ user, login, register, completeOnboarding, logout, loading, authError, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

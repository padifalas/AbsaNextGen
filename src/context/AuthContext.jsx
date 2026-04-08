import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // ask andre if this check localStorage / a token / a backend session.
  // for now wil persist to localStorage so the session survives a page refresh.
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ws_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async ({ email, password }) => {
    setLoading(true);
    setAuthError('');
    try {
      // ── Simulated network delay ──
      await new Promise(r => setTimeout(r, 900));

      // ── Demo validation ──
      if (!email || !password) {
        throw new Error('Please fill in both fields.');
      }
      if (!email.includes('@')) {
        throw new Error('Enter a valid email address.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

     
      const userData = {
        id: 'usr_001',
        email,
        name: email.split('@')[0].replace(/[._]/g, ' '),
        onboarded: false, // change to true after onboarding done
      };

      localStorage.setItem('ws_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ws_user');
    setUser(null);
    setAuthError('');
  };

  const clearError = () => setAuthError('');

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, authError, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

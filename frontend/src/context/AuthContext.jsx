import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('kbr_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kbr_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('kbr_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('kbr_token');
        localStorage.removeItem('kbr_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    // Store the token first so the /me call is authenticated
    localStorage.setItem('kbr_token', res.data.token);
    // Always fetch fresh user data from the server after login
    // so we get 100% up-to-date profile, addresses, role, etc.
    let freshUser = res.data.user;
    try {
      const meRes = await authApi.me();
      freshUser = meRes.data.user;
    } catch {
      // fall back to login response user if /me fails
    }
    localStorage.setItem('kbr_user', JSON.stringify(freshUser));
    setUser(freshUser);
    return freshUser;
  };

  const register = async (data) => {
    return authApi.register(data);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.me();
      setUser(res.data.user);
      localStorage.setItem('kbr_user', JSON.stringify(res.data.user));
    } catch (e) { /* ignore */ }
  };

  const logout = () => {
    localStorage.removeItem('kbr_token');
    localStorage.removeItem('kbr_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

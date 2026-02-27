import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import {
  apiRequest,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  getStoredUser,
  setStoredUser,
  type StoredUser,
} from '../lib/api';

interface User extends StoredUser {}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadIdRef = useRef(0);

  const loadUser = useCallback(async () => {
    const currentLoadId = ++loadIdRef.current;

    const token = getStoredToken();
    if (!token) {
      const cached = getStoredUser();
      if (cached) {
        setUser(cached);
      } else {
        setUser(null);
      }
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{ user: User }>('/api/auth/me', { token });
      if (currentLoadId !== loadIdRef.current) return;
      setUser(data.user);
      setStoredUser(data.user);
    } catch {
      if (currentLoadId !== loadIdRef.current) return;
      clearStoredToken();
      setUser(null);
    } finally {
      if (currentLoadId === loadIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const loginWithToken = useCallback(async (token: string) => {
    setStoredToken(token);
    await loadUser();
  }, [loadUser]);

  const signOut = async () => {
    clearStoredToken();
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

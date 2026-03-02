import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { api, User as ApiUser } from '../lib/api';

interface User {
  id: string;
  telegram_id: number | null;
  telegram_username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  photo_url?: string | null;
  email?: string | null;
  is_admin: boolean;
  is_seller: boolean;
  seller_id?: string | null;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadIdRef = useRef(0);

  const loadUser = useCallback(async () => {
    const currentLoadId = ++loadIdRef.current;
    try {
      const token = localStorage.getItem('auth_token');

      if (currentLoadId !== loadIdRef.current) return;

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get<{ user: ApiUser; roles: string[] }>('/api/auth/me');

      if (currentLoadId !== loadIdRef.current) return;

      const dbUser = response.user;
      const roles = response.roles || [];

      setUser({
        id: dbUser.id,
        telegram_id: dbUser.telegram_id,
        telegram_username: dbUser.telegram_username,
        first_name: dbUser.first_name,
        last_name: dbUser.last_name,
        photo_url: dbUser.photo_url,
        email: dbUser.email,
        is_admin: dbUser.is_admin,
        is_seller: dbUser.is_seller,
        seller_id: dbUser.seller_id,
        roles,
      });

    } catch (error) {
      if (currentLoadId !== loadIdRef.current) return;
      console.error('Error loading user:', error);
      setUser(null);
      api.clearAuthToken();
    } finally {
      if (currentLoadId === loadIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signOut = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      api.clearAuthToken();
      setUser(null);
    }
  };

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
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

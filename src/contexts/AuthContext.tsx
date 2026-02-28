import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/api';

interface User {
  id: string;
  user_id?: string;
  telegram_id: number;
  telegram_username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  email?: string;
  oauth_provider?: string;
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
      const { data: { session } } = await supabase.auth.getSession();

      if (currentLoadId !== loadIdRef.current) return;

      if (!session?.user) {
        setUser(null);
        return;
      }

      const metadata = session.user.user_metadata;

      const isTelegramUser = !!metadata.telegram_id;
      const query = supabase
        .from('users')
        .select('id, user_id, telegram_id, telegram_username, first_name, last_name, photo_url, email, oauth_provider');

      const { data: dbUser, error: dbError } = await (
        isTelegramUser
          ? query.eq('id', metadata.user_id)
          : query.eq('user_id', metadata.user_id)
      ).maybeSingle();

      if (currentLoadId !== loadIdRef.current) return;

      if (dbError || !dbUser) {
        setUser(null);
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', dbUser.id);

      if (currentLoadId !== loadIdRef.current) return;

      setUser({
        id: dbUser.id,
        user_id: dbUser.user_id,
        telegram_id: dbUser.telegram_id,
        telegram_username: dbUser.telegram_username,
        first_name: dbUser.first_name,
        last_name: dbUser.last_name,
        photo_url: dbUser.photo_url,
        email: dbUser.email,
        oauth_provider: dbUser.oauth_provider,
        roles: roles?.map(r => r.role) || [],
      });

    } catch (error) {
      if (currentLoadId !== loadIdRef.current) return;
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      if (currentLoadId === loadIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, [loadUser]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
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

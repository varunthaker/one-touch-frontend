import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session, User } from '@supabase/supabase-js';
import { setTokenGetter } from '../config/axios';
import { supabase } from '../config/supabaseClient';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  roles: string[];
  mustChangePassword: boolean;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isKaryakarta: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const rolesFromUser = (user: User | null): string[] => {
  if (!user) return [];
  const appMetadata = user.app_metadata as { role?: string; roles?: string[] } | undefined;
  const rawRoles = appMetadata?.roles || (appMetadata?.role ? [appMetadata.role] : []);
  const validRoles = ['admin', 'karyakarta'];
  return [...new Set(rawRoles)].filter((role) => validRoles.includes(role));
};

const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);

      // Safety net: if Supabase's redirect_to wasn't honored (e.g. not on the
      // Redirect URLs allowlist), it falls back to the Site URL and we'd land
      // wherever that is instead of the reset-password page. Catch the
      // PASSWORD_RECOVERY event here regardless of which page we landed on.
      if (event === 'PASSWORD_RECOVERY' && window.location.pathname !== '/reset-password') {
        navigate('/reset-password', { replace: true });
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Set up the token getter for axios
  useEffect(() => {
    const tokenGetter = async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    };

    setTokenGetter(tokenGetter);
  }, []);

  const login = () => {
    window.location.href = '/sign-in';
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const roles = rolesFromUser(session?.user ?? null);
  const mustChangePassword = session?.user?.user_metadata?.must_change_password === true;

  // Helper functions for role checking
  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some(role => roles.includes(role));
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isKaryakarta = (): boolean => {
    return hasRole('karyakarta');
  };

  const value: AuthContextType = {
    isAuthenticated: !!session,
    isLoading,
    user: session?.user ?? null,
    roles,
    mustChangePassword,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAdmin,
    isKaryakarta,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <AuthContextProvider>{children}</AuthContextProvider>
  );
};

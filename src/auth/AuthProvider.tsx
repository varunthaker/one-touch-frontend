import React, { createContext, useContext, useEffect, useState } from 'react';
import { setTokenGetter } from '../config/axios';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';


interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  roles: string[];
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut, getToken } = useClerkAuth();

  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    // For now, let's set a default admin role for testing
    setRoles(['admin']);
  }, []);

  // Set up the token getter for axios
  useEffect(() => {
    const tokenGetter = async () => {
      try {
        if (isSignedIn) {
          return await getToken();
        }
        return null;
      } catch (error) {
        console.error('Error getting access token:', error);
        return null;
      }
    };
    
    setTokenGetter(tokenGetter);
  }, [getToken, isSignedIn]);

  const login = () => {
    console.log('Attempting login...');
    // Clerk handles login automatically through ClerkProvider
    window.location.href = '/sign-in';
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    user,
    roles,
    login,
    logout,
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
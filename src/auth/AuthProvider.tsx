import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { setTokenGetter } from '../config/axios';

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
  const { isAuthenticated, isLoading, user, loginWithRedirect, logout: auth0Logout, getAccessTokenSilently } = useAuth0();

  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    // For now, let's set a default admin role for testing
    setRoles(['admin']);
  }, []);

  // Set up the token getter for axios
  useEffect(() => {
    const tokenGetter = async () => {
      try {
        return await getAccessTokenSilently();
      } catch (error) {
        console.error('Error getting access token:', error);
        return null;
      }
    };
    
    setTokenGetter(tokenGetter);
  }, [getAccessTokenSilently]);

  const login = () => {
    console.log('Attempting login...');
    loginWithRedirect();
  };

  const logout = () => {
    auth0Logout({
      returnTo: window.location.origin,
    });
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
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
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = 'http://localhost:5173/'; // Temporary hardcode for testing

  console.log('=== AUTH0 DEBUG INFO ===');
  console.log('Domain:', domain);
  console.log('Client ID:', clientId);
  console.log('Redirect URI:', redirectUri);
  console.log('Current URL:', window.location.href);
  console.log('Origin:', window.location.origin);
  console.log('Port:', window.location.port);
  console.log('Protocol:', window.location.protocol);
  console.log('Hostname:', window.location.hostname);
  console.log('Redirect URI from env:', import.meta.env.VITE_AUTH0_REDIRECT_URL);
  
  console.log('========================');

  if (!domain || !clientId) {
    throw new Error('Missing Auth0 configuration. Please check your environment variables.');
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
    >
      <AuthContextProvider>{children}</AuthContextProvider>
    </Auth0Provider>
  );
}; 
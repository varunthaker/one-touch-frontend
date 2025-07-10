import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'oidc-client-ts';
import { userManager } from './zitadelConfig';
import { useNavigate } from 'react-router-dom';

// Helper function to extract roles from user profile
const extractRoles = (user: User): string[] => {
  try {
    if (user.profile && user.profile['urn:zitadel:iam:org:project:roles']) {
      const rolesClaim = user.profile['urn:zitadel:iam:org:project:roles'];
      return Object.keys(rolesClaim);
    }
    return [];
  } catch (error) {
    console.error('Error extracting roles:', error);
    return [];
  }
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  roles: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleUserLoaded = (user: User) => {
      setUser(user);
      setIsLoading(false);
    };

    const handleUserUnloaded = () => {
      setUser(null);
      setIsLoading(false);
    };

    const handleSilentRenewError = (error: Error) => {
      console.error('Silent renew error:', error);
      setUser(null);
      setIsLoading(false);
    };

    const handleAccessTokenExpired = () => {
      console.log('Access token expired');
      setUser(null);
      setIsLoading(false);
    };

    userManager.events.addUserLoaded(handleUserLoaded);
    userManager.events.addUserUnloaded(handleUserUnloaded);
    userManager.events.addSilentRenewError(handleSilentRenewError);
    userManager.events.addAccessTokenExpired(handleAccessTokenExpired);

    // Check if this is a redirect from authentication
    const checkAuthResponse = async () => {
      try {
        // Check if there's a response in the URL (authentication callback)
        const user = await userManager.signinRedirectCallback();
        if (user) {
          setUser(user);
          setIsLoading(false);
          // Redirect to sabhacenterselector after successful login
          navigate('/sabhacenterselector', { replace: true });
          return;
        }
      } catch (error) {
        // No response in URL, continue with normal flow
        console.log('No authentication response in URL');
      }

      // Check if user is already signed in
      try {
        const user = await userManager.getUser();
        if (user && !user.expired) {
          setUser(user);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
      
      setIsLoading(false);
    };

    checkAuthResponse();

    return () => {
      userManager.events.removeUserLoaded(handleUserLoaded);
      userManager.events.removeUserUnloaded(handleUserUnloaded);
      userManager.events.removeSilentRenewError(handleSilentRenewError);
      userManager.events.removeAccessTokenExpired(handleAccessTokenExpired);
    };
  }, [navigate]);

  const login = async () => {
    try {
      await userManager.signinRedirect();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await userManager.signoutRedirect();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !user.expired,
    roles: user ? extractRoles(user) : [],
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
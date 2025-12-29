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

const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut, getToken } = useClerkAuth();

  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const getUserRoles = async () => {
      if (isSignedIn && user) {
        try {
          // Method 1: Get roles from public metadata
          const publicMetadata = user.publicMetadata as any;
          // Handle both 'role' (singular) and 'roles' (plural) formats
          const rolesFromMetadata = publicMetadata?.roles || (publicMetadata?.role ? [publicMetadata.role] : []);

          // Method 2: Get roles from organization membership (if using organizations)
          let organizationRoles: string[] = [];
          if (user.organizationMemberships && user.organizationMemberships.length > 0) {
            organizationRoles = user.organizationMemberships
              .map(membership => membership.role)
              .filter(role => role !== null) as string[];
          }
          
          // Combine roles from both sources, prioritizing metadata
          const allRoles = [...rolesFromMetadata, ...organizationRoles];
          
          // Remove duplicates and filter for valid roles
          const validRoles = ['admin', 'karyakarta'];
          const filteredRoles = [...new Set(allRoles)].filter(role => 
            validRoles.includes(role)
          );
          
          setRoles(filteredRoles);
        } catch (error) {
          console.error('Error getting user roles:', error);
          // Fallback to empty roles if there's an error
          setRoles([]);
        }
      } else {
        setRoles([]);
      }
    };

    getUserRoles();
  }, [isSignedIn, user]);

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
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    user,
    roles,
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
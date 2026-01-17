/**
 * Authentication Context Provider
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { auth, User } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshUserProfile: () => Promise<void>; // Alias for refreshUserData
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (addressData: any) => Promise<void>;
  updateAddress: (addressId: string, addressData: any) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = auth.getUser();
        const { accessToken, refreshToken } = auth.getTokens();

        if (storedUser && accessToken) {
          // Check if token is expired
          if (auth.isTokenExpired(accessToken)) {
            // Try to refresh token
            if (refreshToken && !auth.isTokenExpired(refreshToken)) {
              const response = await auth.refreshToken(refreshToken);
              auth.setTokens(response.data.accessToken, refreshToken);

              // Fetch fresh user data
              const userResponse = await auth.getMe(response.data.accessToken);
              setUser(userResponse.data);
              auth.setUser(userResponse.data);
            } else {
              // Both tokens expired, clear auth
              auth.clearTokens();
              setUser(null);
            }
          } else {
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        auth.clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user) {
      return;
    }

    const { accessToken, refreshToken } = auth.getTokens();
    if (!accessToken || !refreshToken) {
      return;
    }

    const decoded = auth.decodeToken(accessToken);
    if (!decoded || !decoded.exp) {
      return;
    }

    // Refresh 1 minute before expiry
    const expiresIn = (decoded.exp * 1000) - Date.now() - 60000;
    const expiresAt = new Date(decoded.exp * 1000);
    const refreshAt = new Date(Date.now() + expiresIn);

    if (expiresIn > 0) {
      const timer = setTimeout(async () => {
        try {
          const response = await auth.refreshToken(refreshToken);
          auth.setTokens(response.data.accessToken, refreshToken);
        } catch (error) {
          console.error('[Auth] Auto-refresh failed:', error);
          await logout();
        }
      }, expiresIn);

      return () => {
        clearTimeout(timer);
      };
    } else {
      // Token already expired or expires too soon
      (async () => {
        try {
          const response = await auth.refreshToken(refreshToken);
          auth.setTokens(response.data.accessToken, refreshToken);
        } catch (error) {
          console.error('[Auth] Immediate refresh failed:', error);
          await logout();
        }
      })();
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login({ email, password });

      auth.setTokens(response.data.accessToken, response.data.refreshToken);
      auth.setUser(response.data.user);
      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await auth.register(data);

      auth.setTokens(response.data.accessToken, response.data.refreshToken);
      auth.setUser(response.data.user);
      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { accessToken, refreshToken } = auth.getTokens();
      if (accessToken && refreshToken) {
        await auth.logout(accessToken, refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      auth.clearTokens();
      setUser(null);
      router.push('/login');
    }
  };

  const refreshUserData = async () => {
    try {
      const accessToken = auth.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token');
      }

      const response = await auth.getMe(accessToken);
      setUser(response.data);
      auth.setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const accessToken = auth.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token');
      }

      const response = await auth.updateProfile(accessToken, data);
      setUser(response.data);
      auth.setUser(response.data);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const addAddress = async (addressData: any) => {
    try {
      const accessToken = auth.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token');
      }

      const response = await auth.addAddress(accessToken, addressData);
      setUser(response.data);
      auth.setUser(response.data);
    } catch (error) {
      console.error('Failed to add address:', error);
      throw error;
    }
  };

  const updateAddress = async (addressId: string, addressData: any) => {
    try {
      const accessToken = auth.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token');
      }

      const response = await auth.updateAddress(accessToken, addressId, addressData);
      setUser(response.data);
      auth.setUser(response.data);
    } catch (error) {
      console.error('Failed to update address:', error);
      throw error;
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const accessToken = auth.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token');
      }

      const response = await auth.deleteAddress(accessToken, addressId);
      setUser(response.data);
      auth.setUser(response.data);
    } catch (error) {
      console.error('Failed to delete address:', error);
      throw error;
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      const accessToken = auth.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token');
      }

      const response = await auth.setDefaultAddress(accessToken, addressId);
      setUser(response.data);
      auth.setUser(response.data);
    } catch (error) {
      console.error('Failed to set default address:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshUserData,
    refreshUserProfile: refreshUserData, // Alias for refreshUserData
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

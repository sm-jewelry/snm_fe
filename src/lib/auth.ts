/**
 * Authentication utility functions for customer service integration
 * All requests now go through the API Gateway for enhanced security
 */

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  profilePicture?: string;
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

export interface TokenResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
  message: string;
}

export const auth = {
  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important: send cookies through gateway
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important: send cookies through gateway
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {

    const response = await fetch(`${API_GATEWAY_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important: send cookies through gateway
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Auth API] Refresh failed:', errorData);
      throw new Error(errorData.message || 'Token refresh failed');
    }

    const data = await response.json();
    return data;
  },

  /**
   * Logout user
   */
  async logout(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await fetch(`${API_GATEWAY_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include', // Important: send cookies through gateway
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Get current user profile
   */
  async getMe(accessToken: string): Promise<{ success: boolean; data: User }> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include', // Important: send cookies through gateway
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  },

  /**
   * Update user profile
   */
  async updateProfile(accessToken: string, data: Partial<User>): Promise<{ success: boolean; data: User }> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include', // Important: send cookies through gateway
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Profile update failed');
    }

    return response.json();
  },

  /**
   * Change password
   */
  async changePassword(accessToken: string, currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include', // Important: send cookies through gateway
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password change failed');
    }
  },

  /**
   * Store tokens in localStorage
   */
  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  },

  /**
   * Get tokens from localStorage
   */
  getTokens(): { accessToken: string | null; refreshToken: string | null } {
    if (typeof window !== 'undefined') {
      return {
        accessToken: localStorage.getItem('access_token'),
        refreshToken: localStorage.getItem('refresh_token'),
      };
    }
    return { accessToken: null, refreshToken: null };
  },

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },

  /**
   * Clear tokens and user data
   */
  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Store user in localStorage
   */
  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  /**
   * Get user from localStorage
   */
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const { accessToken } = this.getTokens();
    return !!accessToken;
  },

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  },

  /**
   * Decode JWT token (without verification - for client-side only)
   */
  decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded;
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  },

  /**
   * Add new address
   */
  async addAddress(accessToken: string, addressData: any): Promise<any> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include', // Important: send cookies through gateway
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add address');
    }

    return response.json();
  },

  /**
   * Update address
   */
  async updateAddress(accessToken: string, addressId: string, addressData: any): Promise<any> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include', // Important: send cookies through gateway
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update address');
    }

    return response.json();
  },

  /**
   * Delete address
   */
  async deleteAddress(accessToken: string, addressId: string): Promise<any> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include', // Important: send cookies through gateway
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete address');
    }

    return response.json();
  },

  /**
   * Set default address
   */
  async setDefaultAddress(accessToken: string, addressId: string): Promise<any> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/addresses/${addressId}/default`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include', // Important: send cookies through gateway
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set default address');
    }

    return response.json();
  },

  // ============================================
  // PASSWORD RESET METHODS
  // ============================================

  /**
   * Request password reset OTP
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset OTP');
    }

    return data;
  },

  /**
   * Verify password reset OTP
   */
  async verifyResetOtp(email: string, otp: string): Promise<{ success: boolean; data: { resetToken: string }; message: string }> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid or expired OTP');
    }

    return data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(email: string, resetToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, resetToken, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  },

  // ============================================
  // EMAIL VERIFICATION METHODS
  // ============================================

  /**
   * Send email verification OTP
   */
  async sendEmailVerification(accessToken: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send verification email');
    }

    return data;
  },

  /**
   * Verify email with OTP
   */
  async verifyEmail(accessToken: string, otp: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_GATEWAY_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify email');
    }

    return data;
  },
};

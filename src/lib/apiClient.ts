/**
 * API Client with authentication support
 * Handles all API calls through the API Gateway with automatic token refresh
 */

import { auth } from './auth';

// All requests now go through the API Gateway
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const accessToken = auth.getAccessToken();

    if (!accessToken) {
      return {
        'Content-Type': 'application/json',
      };
    }

    // Check if token is expired
    if (auth.isTokenExpired(accessToken)) {
      const { refreshToken } = auth.getTokens();

      if (refreshToken && !auth.isTokenExpired(refreshToken)) {
        try {
          const response = await auth.refreshToken(refreshToken);
          auth.setTokens(response.data.accessToken, refreshToken);

          return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${response.data.accessToken}`,
          };
        } catch (error) {
          // Refresh failed, clear tokens
          auth.clearTokens();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      } else {
        // Refresh token expired
        auth.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };
  }

  private async request(url: string, options: RequestOptions = {}): Promise<any> {
    const { requiresAuth = false, headers, ...restOptions } = options;

    // Check if auth is required but no token is available
    if (requiresAuth) {
      const accessToken = auth.getAccessToken();
      if (!accessToken) {
        throw new Error('Please login to continue');
      }
    }

    const requestHeaders: HeadersInit = requiresAuth
      ? await this.getAuthHeaders()
      : { 'Content-Type': 'application/json', ...headers };

    const response = await fetch(url, {
      ...restOptions,
      headers: { ...requestHeaders, ...headers },
      credentials: 'include', // Important: send cookies through gateway
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  // ==================== CART SERVICE (via Gateway) ====================

  async getCart() {
    return this.request(`${API_GATEWAY_URL}/api/cart`, {
      requiresAuth: true,
    });
  }

  async addToCart(productId: string, url: string, title: string, price: number, quantity: number, meta?: any) {
    return this.request(`${API_GATEWAY_URL}/api/cart/add`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ productId, url, title, price, quantity, meta }),
    });
  }

  async updateCartItem(productId: string, quantity: number) {
    return this.request(`${API_GATEWAY_URL}/api/cart/item/${productId}`, {
      method: 'PATCH',
      requiresAuth: true,
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(productId: string) {
    return this.request(`${API_GATEWAY_URL}/api/cart/item/${productId}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  async clearCart() {
    return this.request(`${API_GATEWAY_URL}/api/cart/clear`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  // ==================== WISHLIST SERVICE (via Gateway) ====================

  async getWishlist() {
    return this.request(`${API_GATEWAY_URL}/api/wishlist`, {
      requiresAuth: true,
    });
  }

  async addToWishlist(productId: string) {
    return this.request(`${API_GATEWAY_URL}/api/wishlist/add`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string) {
    return this.request(`${API_GATEWAY_URL}/api/wishlist/${productId}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  // ==================== CATALOG SERVICE (via Gateway) ====================

  async getProducts(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`${API_GATEWAY_URL}/api/catalogs${query}`);
  }

  async getProduct(id: string) {
    return this.request(`${API_GATEWAY_URL}/api/catalogs/${id}`);
  }

  async getCategories() {
    return this.request(`${API_GATEWAY_URL}/api/categories`);
  }

  async getCategory(id: string) {
    return this.request(`${API_GATEWAY_URL}/api/categories/${id}`);
  }

  async getCategoryProducts(id: string) {
    return this.request(`${API_GATEWAY_URL}/api/categories/${id}/products`);
  }

  async getCollections() {
    return this.request(`${API_GATEWAY_URL}/api/collections`);
  }

  async getCollection(id: string) {
    return this.request(`${API_GATEWAY_URL}/api/collections/${id}`);
  }

  async getCollectionProducts(collectionId: string) {
    return this.request(`${API_GATEWAY_URL}/api/catalogs/collection/${collectionId}`);
  }

  async getNewArrivals() {
    return this.request(`${API_GATEWAY_URL}/api/new-arrivals`);
  }

  // Admin only - create product
  async createProduct(data: any) {
    return this.request(`${API_GATEWAY_URL}/api/catalogs`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(data),
    });
  }

  // Admin only - update product
  async updateProduct(id: string, data: any) {
    return this.request(`${API_GATEWAY_URL}/api/catalogs/${id}`, {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify(data),
    });
  }

  // Admin only - delete product
  async deleteProduct(id: string) {
    return this.request(`${API_GATEWAY_URL}/api/catalogs/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  // ==================== ORDER SERVICE (via Gateway) ====================

  async createOrder(orderData: any) {
    return this.request(`${API_GATEWAY_URL}/api/orders`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(orderData),
    });
  }

  async getMyOrders() {
    return this.request(`${API_GATEWAY_URL}/api/orders/my-orders`, {
      requiresAuth: true,
    });
  }

  async getOrder(id: string) {
    return this.request(`${API_GATEWAY_URL}/api/orders/${id}`, {
      requiresAuth: true,
    });
  }

  async verifyPayment(paymentData: any) {
    return this.request(`${API_GATEWAY_URL}/api/payments/verify`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(paymentData),
    });
  }

  // ==================== USER SERVICE (via Gateway) ====================

  async getMyProfile() {
    return this.request(`${API_GATEWAY_URL}/api/auth/me`, {
      requiresAuth: true,
    });
  }

  async updateMyProfile(data: any) {
    return this.request(`${API_GATEWAY_URL}/api/auth/me`, {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request(`${API_GATEWAY_URL}/api/auth/change-password`, {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Address Management
  async addAddress(addressData: any) {
    return this.request(`${API_GATEWAY_URL}/api/auth/addresses`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(addressId: string, addressData: any) {
    return this.request(`${API_GATEWAY_URL}/api/auth/addresses/${addressId}`, {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(addressId: string) {
    return this.request(`${API_GATEWAY_URL}/api/auth/addresses/${addressId}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  async setDefaultAddress(addressId: string) {
    return this.request(`${API_GATEWAY_URL}/api/auth/addresses/${addressId}/default`, {
      method: 'PUT',
      requiresAuth: true,
    });
  }

  // ==================== ADMIN USER MANAGEMENT (via Gateway) ====================

  async getAllUsers(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`${API_GATEWAY_URL}/api/users${query}`, {
      requiresAuth: true,
    });
  }

  async getUserById(userId: string) {
    return this.request(`${API_GATEWAY_URL}/api/users/${userId}`, {
      requiresAuth: true,
    });
  }

  async updateUser(userId: string, data: any) {
    return this.request(`${API_GATEWAY_URL}/api/users/${userId}`, {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`${API_GATEWAY_URL}/api/users/${userId}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  async deactivateUser(userId: string) {
    return this.request(`${API_GATEWAY_URL}/api/users/${userId}/deactivate`, {
      method: 'PATCH',
      requiresAuth: true,
    });
  }

  async activateUser(userId: string) {
    return this.request(`${API_GATEWAY_URL}/api/users/${userId}/activate`, {
      method: 'PATCH',
      requiresAuth: true,
    });
  }

  async getUserStats() {
    return this.request(`${API_GATEWAY_URL}/api/users/stats`, {
      requiresAuth: true,
    });
  }
}

export const apiClient = new ApiClient();
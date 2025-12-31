const API_BASE =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";

// Helper to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

    if (!decoded || !decoded.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (error) {
    return true;
  }
};

// Helper to refresh access token
const refreshAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken || isTokenExpired(refreshToken)) {
    console.error("[Fetcher] Refresh token expired or missing");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const newAccessToken = data.data.accessToken;

    // Store new access token
    localStorage.setItem("access_token", newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("[Fetcher] ❌ Token refresh failed:", error);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return null;
  }
};

// Main fetcher function with automatic token refresh
export const fetcher = async (url: string, options: RequestInit = {}, retryCount = 0): Promise<any> => {
  let token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // Check if token is expired and refresh if needed
  if (token && isTokenExpired(token) && retryCount === 0) {
    token = await refreshAccessToken();

    if (!token) {
      throw new Error("Authentication failed. Please login again.");
    }
  }

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }), // skip for form data
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle 401 Unauthorized - token might have expired during the request
  if (res.status === 401 && retryCount === 0) {

    const newToken = await refreshAccessToken();

    if (newToken) {
      // Retry the request with new token
      return fetcher(url, options, retryCount + 1);
    }
  }

  if (!res.ok) {
    let msg = "API error";
    try {
      const errorData = await res.json();
      msg = errorData.message || msg;
    } catch {
      msg = await res.text();
    }
    throw new Error(msg);
  }

  // 🔥 If it's a file upload (FormData), return Response (so caller can parse manually)
  if (isFormData) return res;

  // For JSON APIs, automatically parse
  return res.json();
};

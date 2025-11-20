"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const LOGIN_FRONTEND_URL = process.env.NEXT_PUBLIC_LOGIN_FRONTEND_URL;

interface UserInfo {
  email: string;
  role?: string;
  projects?: string[];
  tenants?: Array<{
    tenant_id: string;
    role: string;
    projects: any[];
  }>;
  primary_tenant?: string;
  name?: {
    first?: string;
    last?: string;
  };
  [key: string]: any;
}

// 🔥 Tenant detection based on domain (CLIENT-SIDE ONLY)
function detectTenant(): string {
  if (typeof window === 'undefined') {
    return 'my-frontend';
  }

  const hostname = window.location.hostname;
  const port = window.location.port;

  if (port === '3000' || hostname.includes('snm.jewelry')) {
    return 'my-frontend';
  } else if (port === '3001' || hostname.includes('nqd.ai')) {
    return 'nqd-chatbox';
  }

  return 'my-frontend';
}

// 🔥 Get login URL with tenant context
function getLoginUrl(tenantId: string, returnTo: string): string {
  return `${LOGIN_FRONTEND_URL}/login?tenant_id=${tenantId}&return_to=${encodeURIComponent(returnTo)}`;
}

// 🔥 Check if user has access to tenant
function hasAccessToTenant(user: UserInfo, tenantId: string): boolean {
  if (!user.tenants || !Array.isArray(user.tenants)) {
    return false;
  }
  
  return user.tenants.some(tenant => tenant.tenant_id === tenantId);
}

// 🔥 Get user's tenant names
function getUserTenantNames(user: UserInfo): string {
  if (!user.tenants || !Array.isArray(user.tenants)) {
    return 'none';
  }
  return user.tenants.map(t => t.tenant_id).join(', ');
}

// ---------------- Token Refresh (Server API call) ----------------
async function refreshAccessTokenOnServer(refreshToken: string) {
  if (!refreshToken) throw new Error("No refresh token available");

  const resp = await fetch("/api/refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error || "Failed to refresh token");
  }

  if (data.access_token) localStorage.setItem("access_token", data.access_token);
  if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
  if (data.id_token) localStorage.setItem("id_token", data.id_token);

  return data.access_token;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string>('my-frontend');
  const [mounted, setMounted] = useState(false);
  const [tokensProcessed, setTokensProcessed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 🔥 Detect tenant only on client-side mount
  useEffect(() => {
    setMounted(true);
    const detectedTenant = detectTenant();
    setTenantId(detectedTenant);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('tenant_id', detectedTenant);
    }
  }, []);

  // 🔥 CRITICAL: Handle tokens from URL FIRST, before any other logic
  useEffect(() => {
    if (!mounted) return;

    const handleTokensFromURL = () => {
      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      const accessTokenFromURL = params.get("access_token");
      const refreshTokenFromURL = params.get("refresh_token");
      const idTokenFromURL = params.get("id_token");

      // 🔥 If tokens in URL, save them IMMEDIATELY
      if (accessTokenFromURL || refreshTokenFromURL || idTokenFromURL) {
        
        if (accessTokenFromURL) {
          localStorage.setItem("access_token", accessTokenFromURL);
        }
        if (refreshTokenFromURL) {
          localStorage.setItem("refresh_token", refreshTokenFromURL);
        }
        if (idTokenFromURL) {
          localStorage.setItem("id_token", idTokenFromURL);
        }

        // Clean URL
        const url = new URL(window.location.href);
        url.searchParams.delete("access_token");
        url.searchParams.delete("refresh_token");
        url.searchParams.delete("id_token");
        window.history.replaceState({}, document.title, url.toString());
        
      }
      
      // Mark tokens as processed
      setTokensProcessed(true);
    };

    handleTokensFromURL();
  }, [mounted]);

  // 🔥 Fetch user info ONLY after tokens are processed
  useEffect(() => {
    if (!mounted || !tokensProcessed) return;

    const fetchUserInfo = async () => {
      let accessToken = localStorage.getItem("access_token");
      let refreshToken = localStorage.getItem("refresh_token");

      // 🔥 Only redirect to login if NO tokens exist
      if (!accessToken && !refreshToken) {
        const loginUrl = getLoginUrl(tenantId, window.location.href);
        window.location.href = loginUrl;
        return;
      }

      // Try to refresh if only refresh token exists
      if (!accessToken && refreshToken) {
        try {
          accessToken = await refreshAccessTokenOnServer(refreshToken);
        } catch (err) {
          localStorage.clear();
          const loginUrl = getLoginUrl(tenantId, window.location.href);
          window.location.href = loginUrl;
          return;
        }
      }

      // ---------------- Bounded retry logic ----------------
      let hasRefreshed = false;
      setLoading(true);

      const attemptFetch = async (): Promise<void> => {
        try {
          const resp = await fetch("/api/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (resp.status === 401) {
            if (!hasRefreshed && refreshToken) {
              hasRefreshed = true;
              try {
                accessToken = await refreshAccessTokenOnServer(refreshToken);
                return attemptFetch();
              } catch (err) {
                localStorage.clear();
                const loginUrl = getLoginUrl(tenantId, window.location.href);
                window.location.href = loginUrl;
                return;
              }
            } else {
              localStorage.clear();
              const loginUrl = getLoginUrl(tenantId, window.location.href);
              window.location.href = loginUrl;
              return;
            }
          }

          if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}`);
          }

          const data = await resp.json();

          // 🔥 Validate tenant access using tenants array
          if (!hasAccessToTenant(data, tenantId)) {
          
            setLoading(false);
            return;
          }
          setUser(data);
        } catch (err: any) {
          setError("Failed to fetch user info");
        } finally {
          setLoading(false);
        }
      };

      await attemptFetch();
    };

    fetchUserInfo();
  }, [tenantId, mounted, tokensProcessed]);

  // ---------------- Logout ----------------
  const handleLogout = async () => {
    if (typeof window === 'undefined') return;
    
    localStorage.clear();
    const returnTo = window.location.origin;
    window.location.href = `${LOGIN_FRONTEND_URL}/logout-sync?return_to=${encodeURIComponent(returnTo)}`;
  };

  if (!mounted || !tokensProcessed || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui'
      }}>
        <div>Loading user info...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          background: '#fff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>⚠️</div>
          <h2 style={{ color: '#d63031', marginBottom: '16px' }}>
            Access Denied
          </h2>
          <p style={{ 
            whiteSpace: 'pre-line', 
            color: '#333',
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            {error}
          </p>
          <button
            onClick={handleLogout}
            style={{
              padding: '12px 24px',
              background: '#d63031',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              marginRight: '10px'
            }}
          >
            Log Out
          </button>
          <button
            onClick={() => window.location.href = `${LOGIN_FRONTEND_URL}/login?tenant_id=${tenantId}&return_to=${encodeURIComponent(window.location.href)}`}
            style={{
              padding: '12px 24px',
              background: '#0984e3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Register for This Site
          </button>
        </div>
      </div>
    );
  }

  // Get current tenant info from user's tenants array
  const currentTenantInfo = user?.tenants?.find(t => t.tenant_id === tenantId);

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <ul>
          <li className="active">Dashboard</li>
          <li
            className={pathname === "/wishlist" ? "active" : ""}
            onClick={() => router.push("/wishlist")}
          >
            Wishlist
          </li>
          <li onClick={handleLogout}>Log out</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        <h1>Account</h1>

        {/* Tenant indicator */}
        <div style={{
          padding: '12px',
          background: '#e3f2fd',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #90caf9'
        }}>
          <strong>Current Site:</strong> {tenantId} |
          <strong> Your Sites:</strong> {user ? getUserTenantNames(user) : 'Loading...'}
        </div>

        {user ? (
          <div className="user-info">
            <p>Hello {user.email}</p>
            <div className="account-details">
              <table>
                <tbody>
                  <tr>
                    <td>Name</td>
                    <td>{user.name?.first} {user.name?.last}</td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <td>Primary Tenant</td>
                    <td><strong>{user.primary_tenant || 'N/A'}</strong></td>
                  </tr>
                  <tr>
                    <td>Role on This Site</td>
                    <td>{currentTenantInfo?.role || "N/A"}</td>
                  </tr>
                  <tr>
                    <td>All Registered Sites</td>
                    <td>{getUserTenantNames(user)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button className="btn-primary" onClick={handleLogout}>
              Logout
            </button>
            <button
              className="view-orders-btn"
              onClick={() => router.push("/my-orders")}
            >
              View My Orders
            </button>
          </div>
        ) : (
          <p>No user info available</p>
        )}
      </div>
    </div>
  );
}
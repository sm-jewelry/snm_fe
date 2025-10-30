import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const LOGIN_FRONTEND_URL = process.env.NEXT_PUBLIC_LOGIN_FRONTEND_URL; // your Hydra-Kratos frontend

interface UserInfo {
  email: string;
  role?: string;
  projects?: string[];
  [key: string]: any;
}

// ---------------- JWT Decode helper ----------------
function decodeJWT(token: string) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

// ---------------- Token Refresh (Server API call) ----------------
async function refreshAccessTokenOnServer(refreshToken: string) {
  if (!refreshToken) throw new Error("No refresh token available");

  console.log("🔄 Refreshing access token...");

  const resp = await fetch("/api/refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    console.error("❌ Refresh token failed:", data);
    throw new Error(data?.error || "Failed to refresh token");
  }

  // Save tokens if present
  if (data.access_token) localStorage.setItem("access_token", data.access_token);
  if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
  if (data.id_token) localStorage.setItem("id_token", data.id_token);

  return data.access_token;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = router.pathname;

  useEffect(() => {
    // ---------------- Handle tokens from URL ----------------
    const handleTokensFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      const accessTokenFromURL = params.get("access_token");
      const refreshTokenFromURL = params.get("refresh_token");
      const idTokenFromURL = params.get("id_token");

      if (accessTokenFromURL) localStorage.setItem("access_token", accessTokenFromURL);
      if (refreshTokenFromURL) localStorage.setItem("refresh_token", refreshTokenFromURL);
      if (idTokenFromURL) localStorage.setItem("id_token", idTokenFromURL);

      // Clean sensitive data from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("access_token");
      url.searchParams.delete("refresh_token");
      url.searchParams.delete("id_token");
      window.history.replaceState({}, document.title, url.toString());
    };

    handleTokensFromURL();

    // ---------------- Fetch user info ----------------
    const fetchUserInfo = async () => {
      let accessToken = localStorage.getItem("access_token");
      let refreshToken = localStorage.getItem("refresh_token");

      // 🔸 If access token missing → try refresh or redirect
      if (!accessToken) {
        if (!refreshToken) {
          console.warn("⚠️ No access or refresh token, redirecting to login");
          const returnTo = encodeURIComponent(window.location.href);
          window.location.href = `${LOGIN_FRONTEND_URL}?return_to=${returnTo}`;
          return;
        }
        try {
          accessToken = await refreshAccessTokenOnServer(refreshToken);
        } catch (err) {
          console.warn("⚠️ Failed to refresh token, redirecting to login", err);
          localStorage.clear();
          const returnTo = encodeURIComponent(window.location.href);
          window.location.href = `${LOGIN_FRONTEND_URL}?return_to=${returnTo}`;
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
            // 401 Unauthorized → try one refresh
            if (!hasRefreshed && refreshToken) {
              console.warn("🔁 Access token expired, refreshing...");
              hasRefreshed = true;
              try {
                accessToken = await refreshAccessTokenOnServer(refreshToken);
                return attemptFetch(); // retry once
              } catch (err) {
                console.error("❌ Token refresh failed, redirecting to login");
                localStorage.clear();
                const returnTo = encodeURIComponent(window.location.href);
                window.location.href = `${LOGIN_FRONTEND_URL}?return_to=${returnTo}`;
                return;
              }
            } else {
              console.warn("⚠️ Unauthorized and no refresh left, redirecting to login");
              localStorage.clear();
              const returnTo = encodeURIComponent(window.location.href);
              window.location.href = `${LOGIN_FRONTEND_URL}?return_to=${returnTo}`;
              return;
            }
          }

          if (!resp.ok) {
            console.error("❌ Failed to fetch user info:", resp.statusText);
            localStorage.clear();
            const returnTo = encodeURIComponent(window.location.href);
            window.location.href = `${LOGIN_FRONTEND_URL}?return_to=${returnTo}`;
            return;
          }

          const data = await resp.json();
          setUser(data);
        } catch (err: any) {
          console.error("❌ Unexpected error fetching user info:", err);
          setError("Failed to fetch user info");
        } finally {
          setLoading(false);
        }
      };

      await attemptFetch();
    };

    fetchUserInfo();
  }, []);

  // ---------------- Logout ----------------
  const handleLogout = async () => {
  localStorage.clear(); // clear tokens etc
  window.location.href = "/api/logout"; // hit Next.js API route, which redirects to Kratos
};

  if (loading) return <div>Loading user info...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

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

        {user ? (
          <div className="user-info">
            <p>Hello {user.email}</p>
            <div className="account-details">
              <table>
                <tbody>
                  <tr>
                    <td>Name</td>
                    <td>{user.name || "N/A"}</td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <td>Address 1</td>
                    <td>{user.address1 || "-"}</td>
                  </tr>
                  <tr>
                    <td>Address 2</td>
                    <td>{user.address2 || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button className="btn-primary" onClick={handleLogout}>Logout</button>
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

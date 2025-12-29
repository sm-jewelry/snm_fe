"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface UserInfo {
  sub: string;
  email?: string;
  role?: string;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/profile");
          return;
        }

        const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";

        const res = await fetch(`${API_GATEWAY_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const response = await res.json();

        // If token invalid or request failed
        if (!res.ok || !response.success) {
          router.push("/profile");
          return;
        }

        const user = response.data;

        // ✅ Only allow if role === admin
        if (user.role !== "admin") {
          alert("Access denied: Admins only");
          router.push("/");
          return;
        }

        setUser(user);
      } catch (err) {
        console.error("Error checking admin access:", err);
        router.push("/profile");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  const sections = [
    { name: "Categories", path: "/admin/categories" },
    { name: "Catalogs", path: "/admin/catalogs" },
    { name: "Collections", path: "/admin/collections" },
    { name: "Products", path: "/admin/products" },
  ];

  if (loading) {
    return <div className="dashboard-container">Checking access...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">🛠 Admin Dashboard</h1>
      <p>Welcome, {user?.email || "Admin"} 👋</p>

      <ul className="dashboard-list">
        {sections.map((sec) => (
          <li key={sec.name} className="dashboard-item">
            <Link href={sec.path} className="dashboard-link">
              <span>{sec.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;

"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { storage } from "../../lib/storage";
import ErrorBoundary from "../../components/ui/ErrorBoundary";

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
        const token = storage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("/api/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        // If token invalid or no role found
        if (!res.ok || !data.role) {
          router.push("/login");
          return;
        }

        // ✅ Only allow if role === admin
        if (data.role !== "admin") {
          alert("Access denied: Admins only");
          router.push("/");
          return;
        }

        setUser(data);
      } catch (err) {
        console.error("Error checking admin access:", err);
        router.push("/login");
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default AdminDashboard;

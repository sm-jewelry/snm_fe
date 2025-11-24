"use client";
import { useEffect, useState } from "react";

const LOGIN_FRONTEND_URL = process.env.NEXT_PUBLIC_LOGIN_FRONTEND_URL;

export default function SessionWatcher() {
  const [showPopup, setShowPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Decode JWT exp
  function decodeExp(token: string): number | null {
    try {
      const [, payload] = token.split(".");
      const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
      return exp * 1000; // milliseconds
    } catch {
      return null;
    }
  }

  // Refresh token
  async function refreshToken() {
    const refresh = localStorage.getItem("refresh_token");
     const returnTo = window.location.origin;
    if (!refresh) return (window.location.href = `${LOGIN_FRONTEND_URL}/logout-sync?return_to=${encodeURIComponent(returnTo)}`);
    const resp = await fetch("/api/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    const data = await resp.json();
    if (resp.ok) {
      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token)
        localStorage.setItem("refresh_token", data.refresh_token);
      setShowPopup(false);
      startWatcher(); // restart countdown
    } else {
      localStorage.clear();
      const returnTo = window.location.origin;
      window.location.href = `${LOGIN_FRONTEND_URL}/logout-sync?return_to=${encodeURIComponent(returnTo)}`;
    }
  }

  // Start timer based on token exp
  function startWatcher() {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    const expTime = decodeExp(token);

    if (!expTime) return;

    const msUntilExpire = expTime - Date.now();
    const msUntilPopup = msUntilExpire - 60_000; // 1 min before expire

    // Schedule popup
    setTimeout(() => {
      setShowPopup(true);
      let counter = 60;
      setTimeLeft(counter);
      const id = setInterval(() => {
        counter -= 1;
        setTimeLeft(counter);
        if (counter <= 0) {
          clearInterval(id);
          localStorage.clear();
          const returnTo = window.location.origin;
          window.location.href = `${LOGIN_FRONTEND_URL}/logout-sync?return_to=${encodeURIComponent(returnTo)}`;
        }
      }, 1000);
      setIntervalId(id);
    }, msUntilPopup);
  }

  useEffect(() => {
    startWatcher();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (!showPopup) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2 className="popup-title">Session Expiring Soon</h2>
        <p className="popup-text">
          Your session will expire in <strong>{timeLeft}</strong> seconds.
        </p>
        <button className="popup-button" onClick={refreshToken}>
          Continue Session
        </button>
      </div>
    </div>
  );
}

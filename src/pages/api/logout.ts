// pages/api/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Step 1: Ask Kratos for a logout URL (server side)
    const response = await fetch("http://localhost:4433/self-service/logout/browser", {
      credentials: "include",
      headers: { cookie: req.headers.cookie || "" },
    });

    const data = await response.json();

    // Step 2: If Kratos returns a logout URL, redirect the browser there
    if (data.logout_url) {
      return res.redirect(data.logout_url);
    }

    // Step 3: Otherwise, send whatever Kratos sent (debugging)
    return res.status(200).json(data);
  } catch (error) {
    console.error("Logout failed:", error);
    return res.status(500).json({ error: "Logout failed" });
  }
}

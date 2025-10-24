// pages/api/refresh-token.ts
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { refresh_token } = req.body
    if (!refresh_token) {
      return res.status(400).json({ error: "Missing refresh_token" })
    }

    const HYDRA_ADMIN_URL = process.env.HYDRA_ADMIN_URL || "http://localhost:4444"
    const HYDRA_CLIENT_ID = process.env.HYDRA_CLIENT_ID || "my-frontend"

    const params = new URLSearchParams()
    params.append("grant_type", "refresh_token")
    params.append("refresh_token", refresh_token)
    params.append("client_id", HYDRA_CLIENT_ID)

    const tokenResp = await fetch(`${HYDRA_ADMIN_URL}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })

    const data = await tokenResp.json()

    if (!tokenResp.ok) {
      console.error("❌ Token refresh failed:", data)
      return res.status(400).json({ error: "Failed to refresh token", details: data })
    }

    return res.status(200).json(data)
  } catch (err: any) {
    console.error("❌ Server error during token refresh:", err)
    return res.status(500).json({ error: "Server error", details: err.message })
  }
}

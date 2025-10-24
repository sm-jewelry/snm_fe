// pages/api/userinfo.ts
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization
    if (!token) {
      return res.status(401).json({ error: "Missing Authorization header" })
    }

    const HYDRA_ADMIN_URL = process.env.HYDRA_ADMIN_URL || "http://localhost:4444"

    const response = await fetch(`${HYDRA_ADMIN_URL}/userinfo`, {
      headers: { Authorization: token as string },
    })

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (err: any) {
    console.error("❌ Error fetching userinfo:", err)
    return res.status(500).json({ error: "Failed to fetch user info", details: err.message })
  }
}

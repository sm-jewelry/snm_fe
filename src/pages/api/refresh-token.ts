// /pages/api/refresh-token.ts
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { refresh_token } = req.body
    const HYDRA_TOKEN_URL = "http://localhost:4444/oauth2/token"
    const HYDRA_CLIENT_ID = "my-frontend"

    const params = new URLSearchParams()
    params.append("grant_type", "refresh_token")
    params.append("refresh_token", refresh_token)
    params.append("client_id", HYDRA_CLIENT_ID)

    const tokenResp = await fetch(HYDRA_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })

    const data = await tokenResp.json()

    if (!tokenResp.ok) {
      return res.status(400).json({ error: "Failed to refresh token", details: data })
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error("Token refresh failed:", err)
    return res.status(500).json({ error: "Server error", details: err.message })
  }
}

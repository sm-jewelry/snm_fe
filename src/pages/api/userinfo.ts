// pages/api/userinfo.ts
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization
  const resp = await fetch("http://localhost:4444/userinfo", {
    headers: { Authorization: token as string }
  })
  const data = await resp.json()
  res.status(resp.status).json(data)
}

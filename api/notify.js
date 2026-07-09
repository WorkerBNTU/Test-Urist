import { sendTelegramMessage } from '../server/telegram.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const result = await sendTelegramMessage(req.body ?? {})

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message ?? 'Internal error' })
  }
}

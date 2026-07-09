import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { sendTelegramMessage } from './server/telegram.mjs'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function telegramApiPlugin(env) {
  return {
    name: 'telegram-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/notify', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          const body = await readJsonBody(req)
          const result = await sendTelegramMessage(body)

          res.statusCode = result.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result.ok ? { ok: true } : { error: result.error }))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message ?? 'Internal error' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  Object.assign(process.env, {
    TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: env.TELEGRAM_CHAT_ID,
  })

  return {
    plugins: [react(), telegramApiPlugin(env)],
    server: {
      port: 5173,
      strictPort: true,
      host: true,
    },
  }
})

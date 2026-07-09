const STATUS_LABELS = {
  new: 'Новый',
  in_progress: 'В работе',
  closed: 'Закрыт',
}

export function buildTelegramMessage({ name, phone, status }) {
  const statusLabel = STATUS_LABELS[status] ?? status ?? 'Новый'
  return [
    '🆕 Новый клиент добавлен',
    '',
    `👤 Имя: ${name}`,
    `📞 Телефон: ${phone}`,
    `📋 Статус: ${statusLabel}`,
    '',
    `🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`,
  ].join('\n')
}

export async function sendTelegramMessage({ name, phone, status }) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return {
      ok: false,
      status: 500,
      error:
        'Telegram не настроен. Добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env (локально) или в Vercel.',
    }
  }

  if (!name || !phone) {
    return { ok: false, status: 400, error: 'name и phone обязательны' }
  }

  const text = buildTelegramMessage({ name, phone, status })

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  const data = await response.json()

  if (!data.ok) {
    return {
      ok: false,
      status: 502,
      error: data.description ?? 'Telegram API error',
    }
  }

  return { ok: true, status: 200 }
}

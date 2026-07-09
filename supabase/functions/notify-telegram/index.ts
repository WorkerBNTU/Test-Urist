import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  in_progress: 'В работе',
  closed: 'Закрыт',
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')

  if (!token || !chatId) {
    return new Response(
      JSON.stringify({
        error:
          'Задайте секреты TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в Supabase → Edge Functions → Secrets',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { name, phone, status } = await req.json()

    if (!name || !phone) {
      return new Response(JSON.stringify({ error: 'name и phone обязательны' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const statusLabel = STATUS_LABELS[status] ?? status ?? 'Новый'
    const text = [
      '🆕 Новый клиент добавлен',
      '',
      `👤 Имя: ${name}`,
      `📞 Телефон: ${phone}`,
      `📋 Статус: ${statusLabel}`,
      '',
      `🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`,
    ].join('\n')

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })

    const tgData = await tgRes.json()

    if (!tgData.ok) {
      return new Response(
        JSON.stringify({ error: tgData.description ?? 'Telegram API error' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

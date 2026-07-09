import { createClient } from '@supabase/supabase-js'
import type { Client } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase не настроен. Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function addClient(
  name: string,
  phone: string,
  status: Client['status']
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({ name, phone, status })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateClientStatus(
  id: string,
  status: Client['status']
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}

export async function sendTelegramNotification(client: Client): Promise<string | null> {
  const payload = {
    name: client.name,
    phone: client.phone,
    status: client.status,
  }

  // Основной путь: Supabase Edge Function (работает из облака)
  try {
    const { data, error } = await supabase.functions.invoke('notify-telegram', {
      body: payload,
    })

    if (!error && data?.ok) return null
    if (!error && data?.error) return String(data.error)
    if (error) {
      console.warn('Edge Function notify-telegram:', error.message)
    }
  } catch (err) {
    console.warn('Edge Function недоступна:', err)
  }

  // Запасной путь: /api/notify (Vercel или Vite dev middleware)
  try {
    const response = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (response.ok) return null

    const body = await response.json().catch(() => ({}))
    const message = (body as { error?: string }).error ?? response.statusText
    console.warn('Telegram уведомление не отправлено:', message)
    return message
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка сети'
    console.warn('Telegram уведомление не отправлено:', message)
    return message
  }
}

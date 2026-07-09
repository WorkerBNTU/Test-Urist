import { useCallback, useEffect, useState } from 'react'
import { AddClientForm } from './components/AddClientForm'
import { ClientTable } from './components/ClientTable'
import { StatusCounters } from './components/StatusCounters'
import {
  addClient,
  deleteClient,
  fetchClients,
  sendTelegramNotification,
  updateClientStatus,
} from './lib/supabase'
import type { Client, ClientStatus } from './types'

const isConfigured =
  !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY

export default function App() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadClients = useCallback(async () => {
    if (!isConfigured) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchClients()
      setClients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  async function handleAdd(name: string, phone: string) {
    setLoading(true)
    setError(null)
    try {
      const client = await addClient(name, phone, 'new')
      setClients((prev) => [client, ...prev])
      showToast(`Клиент «${name}» добавлен`)

      const tgError = await sendTelegramNotification(client)
      if (tgError) {
        showToast(`Клиент добавлен, но Telegram: ${tgError}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id: string, status: ClientStatus) {
    setLoading(true)
    setError(null)
    try {
      const updated = await updateClientStatus(id, status)
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)))
      showToast('Статус обновлён')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить клиента?')) return
    setLoading(true)
    setError(null)
    try {
      await deleteClient(id)
      setClients((prev) => prev.filter((c) => c.id !== id))
      showToast('Клиент удалён')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления')
    } finally {
      setLoading(false)
    }
  }

  if (!isConfigured) {
    return (
      <div className="setup-screen">
        <div className="setup-card">
          <h1>Юрист CRM</h1>
          <p>Для запуска настройте переменные окружения:</p>
          <pre>{`VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...`}</pre>
          <p>
            Скопируйте <code>.env.example</code> в <code>.env</code> и заполните
            значения. Затем выполните SQL из <code>supabase/schema.sql</code> в
            Supabase Dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⚖️</span>
            <div>
              <h1>Юрист CRM</h1>
              <p>Управление клиентами</p>
            </div>
          </div>
          <AddClientForm onAdd={handleAdd} loading={loading} />
        </div>
      </header>

      <main className="main">
        <StatusCounters clients={clients} />

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <section className="clients-section">
          <div className="section-header">
            <h2>Список клиентов</h2>
            <button className="btn btn-ghost btn-sm" onClick={loadClients} disabled={loading}>
              ↻ Обновить
            </button>
          </div>
          {loading && clients.length === 0 ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <ClientTable
              clients={clients}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              loading={loading}
            />
          )}
        </section>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

import type { Client, ClientStatus } from '../types'
import { StatusSelect } from './StatusSelect'

interface ClientTableProps {
  clients: Client[]
  onStatusChange: (id: string, status: ClientStatus) => Promise<void>
  onDelete: (id: string) => Promise<void>
  loading: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ClientTable({
  clients,
  onStatusChange,
  onDelete,
  loading,
}: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="empty-state">
        <p>Клиентов пока нет</p>
        <span>Добавьте первого клиента, нажав кнопку выше</span>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table className="client-table">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Статус</th>
            <th>Добавлен</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="cell-name">{client.name}</td>
              <td>
                <a href={`tel:${client.phone}`} className="phone-link">
                  {client.phone}
                </a>
              </td>
              <td>
                <StatusSelect
                  value={client.status}
                  onChange={(status) => onStatusChange(client.id, status)}
                  disabled={loading}
                  size="sm"
                />
              </td>
              <td className="cell-date">{formatDate(client.created_at)}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(client.id)}
                  disabled={loading}
                  title="Удалить"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

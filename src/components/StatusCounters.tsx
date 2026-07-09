import { useMemo } from 'react'
import type { Client, ClientStatus } from '../types'
import { STATUS_LABELS, STATUS_ORDER } from '../types'

interface StatusCountersProps {
  clients: Client[]
}

export function StatusCounters({ clients }: StatusCountersProps) {
  const counts = useMemo(() => {
    const result: Record<ClientStatus, number> = {
      new: 0,
      in_progress: 0,
      closed: 0,
    }
    for (const client of clients) {
      result[client.status]++
    }
    return result
  }, [clients])

  return (
    <div className="status-counters">
      {STATUS_ORDER.map((status) => (
        <div key={status} className={`counter-card counter-${status}`}>
          <span className="counter-value">{counts[status]}</span>
          <span className="counter-label">{STATUS_LABELS[status]}</span>
        </div>
      ))}
      <div className="counter-card counter-total">
        <span className="counter-value">{clients.length}</span>
        <span className="counter-label">Всего</span>
      </div>
    </div>
  )
}

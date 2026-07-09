export type ClientStatus = 'new' | 'in_progress' | 'closed'

export interface Client {
  id: string
  name: string
  phone: string
  status: ClientStatus
  created_at: string
}

export const STATUS_LABELS: Record<ClientStatus, string> = {
  new: 'Новый',
  in_progress: 'В работе',
  closed: 'Закрыт',
}

export const STATUS_ORDER: ClientStatus[] = ['new', 'in_progress', 'closed']

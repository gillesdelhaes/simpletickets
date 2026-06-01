import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export interface HistoryEvent {
  id: number
  field: string
  old_value: string | null
  new_value: string | null
  actor_name: string | null
  created_at: string
}

export function useTicketHistory(ticketId: number) {
  return useQuery<HistoryEvent[]>({
    queryKey: ['ticket-history', ticketId],
    queryFn: async () => {
      const { data } = await api.get<HistoryEvent[]>(`/tickets/${ticketId}/history`)
      return data
    },
    staleTime: 30_000,
  })
}

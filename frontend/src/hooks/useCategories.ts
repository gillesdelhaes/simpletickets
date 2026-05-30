import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export interface Category {
  id: number
  name: string
  description: string | null
  sla_policy_id: number | null
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories')
      return data
    },
    staleTime: 5 * 60_000, // categories rarely change
  })
}

import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { setTimezone } from '../types/ticket'

interface AppConfig {
  timezone: string
}

export function useAppConfig() {
  return useQuery<AppConfig>({
    queryKey: ['app-config'],
    queryFn: async () => {
      const { data } = await api.get<AppConfig>('/app-config')
      setTimezone(data.timezone)
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

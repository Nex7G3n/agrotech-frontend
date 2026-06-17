import { httpClient } from '@/shared/api/httpClient'

export const systemService = {
  getStatus: () => httpClient.get('/system/status'),
}

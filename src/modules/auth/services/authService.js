import { httpClient } from '../../../shared/api/httpClient'

export const authService = {
  login: (payload) => httpClient.post('/auth/login', payload),
  register: (payload) => httpClient.post('/auth/register', payload),
  me: () => httpClient.get('/auth/me'),
}

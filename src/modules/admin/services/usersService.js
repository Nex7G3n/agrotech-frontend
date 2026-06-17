import { httpClient } from '@/shared/api/httpClient'

export const usersService = {
  list: () => httpClient.get('/users/'),
  update: (userId, payload) => httpClient.patch(`/users/${userId}`, payload),
  remove: (userId) => httpClient.delete(`/users/${userId}`),
}

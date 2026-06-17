import { httpClient } from '../../../shared/api/httpClient'

export const usersService = {
  list: () => httpClient.get('/users/'),
  update: (id, payload) => httpClient.patch(`/users/${id}`, payload),
  remove: (id) => httpClient.delete(`/users/${id}`),
}

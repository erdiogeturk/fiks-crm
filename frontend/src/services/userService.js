import api from './api'

const BASE = '/users'

export const userService = {
  getAll:        ()           => api.get(BASE),
  getById:       (id)         => api.get(`${BASE}/${id}`),
  create:        (data)       => api.post(BASE, data),
  update:        (id, data)   => api.put(`${BASE}/${id}`, data),
  toggleEnabled: (id)         => api.patch(`${BASE}/${id}/toggle-enabled`),
  remove:        (id)         => api.delete(`${BASE}/${id}`),
}

import api from './api'

const BASE = '/roles'

export const roleService = {
  getAll: () => api.get(BASE),
  getById: (id) => api.get(`${BASE}/${id}`),
  create: (data) => api.post(BASE, data),
  update: (id, data) => api.put(`${BASE}/${id}`, data),
  copy:   (id, data) => api.post(`${BASE}/${id}/copy`, data),
  delete: (id) => api.delete(`${BASE}/${id}`),
}

import api from './api'

export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  getByCustomer: (customerId) => api.get(`/projects/customer/${customerId}`),
  getByStatus: (status) => api.get(`/projects/status/${status}`),
  search: (q) => api.get(`/projects/search?q=${q}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
}

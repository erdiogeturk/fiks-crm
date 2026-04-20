import api from './api'

export const activityService = {
  getAll: () => api.get('/activities'),
  getById: (id) => api.get(`/activities/${id}`),
  getByCustomer: (customerId) => api.get(`/activities/customer/${customerId}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
}

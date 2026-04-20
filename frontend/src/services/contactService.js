import api from './api'

export const contactService = {
  getByCustomer: (customerId) => api.get(`/contacts/customer/${customerId}`),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
}

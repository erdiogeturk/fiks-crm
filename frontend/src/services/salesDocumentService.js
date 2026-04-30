import api from './api'

const BASE = '/sales-documents'

export const salesDocumentService = {
  getAll: () => api.get(BASE),
  getById: (id) => api.get(`${BASE}/${id}`),
  getByCustomer: (customerId) => api.get(`${BASE}/customer/${customerId}`),
  create: (data) => api.post(BASE, data),
  update: (id, data) => api.put(`${BASE}/${id}`, data),
  delete: (id) => api.delete(`${BASE}/${id}`),
}

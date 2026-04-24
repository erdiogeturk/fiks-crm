import api from './api'

const BASE = '/custom-fields'

export const alanService = {
  getColumns: (entityType)       => api.get(`${BASE}/${entityType}/columns`),
  preview:    (entityType, data) => api.post(`${BASE}/${entityType}/preview`, data),
  apply:      (entityType, data) => api.post(`${BASE}/${entityType}/apply`, data),
  deactivate: (entityType, id)   => api.delete(`${BASE}/${entityType}/${id}`),
}

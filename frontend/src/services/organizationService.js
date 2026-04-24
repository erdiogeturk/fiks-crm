import api from './api'

const BASE = '/organizations'

export const organizationService = {
  getAll:              ()        => api.get(BASE),
  getById:             (id)      => api.get(`${BASE}/${id}`),
  getActiveSearchHelp: ()        => api.get(`${BASE}/search-help`),
  search:              (q)       => api.get(`${BASE}/search`, { params: { q } }),
  create:              (data)    => api.post(BASE, data),
  update:              (id, data)=> api.put(`${BASE}/${id}`, data),
  remove:              (id)      => api.delete(`${BASE}/${id}`),
}

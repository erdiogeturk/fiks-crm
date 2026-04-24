import api from './api'

const BASE = '/employees'

export const employeeService = {
  getAll:    ()           => api.get(BASE),
  getById:   (id)         => api.get(`${BASE}/${id}`),
  getActive: ()           => api.get(`${BASE}/active`),
  search:    (q)          => api.get(`${BASE}/search`, { params: { q } }),
  create:    (data)       => api.post(BASE, data),
  update:    (id, data)   => api.put(`${BASE}/${id}`, data),
  remove:    (id)         => api.delete(`${BASE}/${id}`),

  // Org team
  getTeam:      (orgId)           => api.get(`/organizations/${orgId}/team`),
  addTeamMember:(orgId, data)     => api.post(`/organizations/${orgId}/team`, data),
  removeTeamMember:(orgId, memberId) => api.delete(`/organizations/${orgId}/team/${memberId}`),
}

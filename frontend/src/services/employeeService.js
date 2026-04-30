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

  getTeam:         (orgId)                   => api.get(`/organizations/${orgId}/team`),
  getTeamMember:   (orgId, memberId)         => api.get(`/organizations/${orgId}/team/${memberId}`),
  addTeamMember:   (orgId, data)             => api.post(`/organizations/${orgId}/team`, data),
  updateTeamMember:(orgId, memberId, data)   => api.put(`/organizations/${orgId}/team/${memberId}`, data),
  removeTeamMember:(orgId, memberId)         => api.delete(`/organizations/${orgId}/team/${memberId}`),
}

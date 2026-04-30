import api from './api'

const BASE = '/role-permissions'

export const rolePermissionService = {
  getByRole: (roleType) => api.get(`${BASE}/${roleType}`),
  getByRoleAndTable: (roleType, tableName) => api.get(`${BASE}/${roleType}/${tableName}`),
  saveForTable: (roleType, tableName, data) => api.put(`${BASE}/${roleType}/${tableName}`, data),
}

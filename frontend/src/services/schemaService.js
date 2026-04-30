import api from './api'

export const schemaService = {
  getTables: () => api.get('/schema/tables'),
}

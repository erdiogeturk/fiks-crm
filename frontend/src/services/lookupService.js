import api from './api'

const make = (path) => ({
  getAll:    ()        => api.get(`/lookup/${path}`),
  getActive: ()        => api.get(`/lookup/${path}/active`),
  search:    (q)       => api.get(`/lookup/${path}/search`, { params: { q } }),
  getById:   (id)      => api.get(`/lookup/${path}/${id}`),
  create:    (data)    => api.post(`/lookup/${path}`, data),
  update:    (id, data)=> api.put(`/lookup/${path}/${id}`, data),
  remove:    (id)      => api.delete(`/lookup/${path}/${id}`),
})

export const countryService  = { ...make('countries') }
export const regionService   = {
  ...make('regions'),
  getActiveByCountry: (countryId) => api.get(`/lookup/regions/active/by-country/${countryId}`),
}
export const cityService     = {
  ...make('cities'),
  getActiveByCountry: (countryId) => api.get(`/lookup/cities/active/by-country/${countryId}`),
}
export const districtService = {
  ...make('districts'),
  getActiveByCity: (cityId) => api.get(`/lookup/districts/active/by-city/${cityId}`),
}
export const positionService = make('positions')
export const unitService     = make('units')
export const currencyService = make('currencies')

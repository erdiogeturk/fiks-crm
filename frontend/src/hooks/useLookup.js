import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  countryService, regionService, cityService, districtService,
  positionService, unitService, currencyService,
} from '../services/lookupService'

const makeHooks = (key, svc) => () => {
  const qc = useQueryClient()

  const list  = useQuery({ queryKey: [key], queryFn: () => svc.getAll().then(r => r.data.data) })
  const create = useMutation({
    mutationFn: (data) => svc.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  })
  const update = useMutation({
    mutationFn: ({ id, data }) => svc.update(id, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  })
  const remove = useMutation({
    mutationFn: (id) => svc.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  })

  return { list, create, update, remove }
}

export const useCountries  = makeHooks('countries',  countryService)
export const useRegions    = makeHooks('regions',     regionService)
export const useCities     = makeHooks('cities',      cityService)
export const useDistricts  = makeHooks('districts',   districtService)
export const usePositions  = makeHooks('positions',   positionService)
export const useUnits      = makeHooks('units',       unitService)
export const useCurrencies = makeHooks('currencies',  currencyService)

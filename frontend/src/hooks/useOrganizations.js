import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationService } from '../services/organizationService'

export const useOrganizations = () => {
  const qc = useQueryClient()

  const list = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getAll().then(r => r.data.data),
  })

  const searchHelp = useQuery({
    queryKey: ['organizations', 'search-help'],
    queryFn: () => organizationService.getActiveSearchHelp().then(r => r.data.data),
  })

  const create = useMutation({
    mutationFn: (data) => organizationService.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  })

  const update = useMutation({
    mutationFn: ({ id, data }) => organizationService.update(id, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  })

  const remove = useMutation({
    mutationFn: (id) => organizationService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  })

  return { list, searchHelp, create, update, remove }
}

export const useOrganization = (id) =>
  useQuery({
    queryKey: ['organizations', id],
    queryFn: () => organizationService.getById(id).then(r => r.data.data),
    enabled: !!id,
  })

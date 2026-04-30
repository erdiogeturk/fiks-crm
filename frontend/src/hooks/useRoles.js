import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roleService } from '../services/roleService'

const KEY = 'roles'

export const useRoles = () =>
  useQuery({
    queryKey: [KEY],
    queryFn: () => roleService.getAll().then(r => r.data.data),
  })

export const useCreateRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => roleService.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export const useUpdateRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => roleService.update(id, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export const useCopyRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => roleService.copy(id, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export const useDeleteRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => roleService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'

export const useUsers = () => {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] })

  const list = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll().then(r => r.data.data),
  })

  const create = useMutation({
    mutationFn: (data) => userService.create(data).then(r => r.data.data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, data }) => userService.update(id, data).then(r => r.data.data),
    onSuccess: invalidate,
  })

  const toggleEnabled = useMutation({
    mutationFn: (id) => userService.toggleEnabled(id).then(r => r.data.data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id) => userService.remove(id),
    onSuccess: invalidate,
  })

  return { list, create, update, toggleEnabled, remove }
}

export const useUser = (id) =>
  useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getById(id).then(r => r.data.data),
    enabled: !!id,
  })

export const useRoleSummary = () =>
  useQuery({
    queryKey: ['users', 'roles', 'summary'],
    queryFn: () => userService.getRoleSummary().then(r => r.data.data),
  })

export const useUsersByRole = (role) =>
  useQuery({
    queryKey: ['users', 'by-role', role],
    queryFn: () => userService.getByRole(role).then(r => r.data.data),
    enabled: !!role,
  })

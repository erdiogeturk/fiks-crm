import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeService } from '../services/employeeService'

export const useEmployees = () => {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['employees'] })

  const list = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll().then(r => r.data.data),
  })

  const active = useQuery({
    queryKey: ['employees', 'active'],
    queryFn: () => employeeService.getActive().then(r => r.data.data),
  })

  const create = useMutation({
    mutationFn: (data) => employeeService.create(data).then(r => r.data.data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, data }) => employeeService.update(id, data).then(r => r.data.data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id) => employeeService.remove(id),
    onSuccess: invalidate,
  })

  return { list, active, create, update, remove }
}

export const useEmployee = (id) =>
  useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeeService.getById(id).then(r => r.data.data),
    enabled: !!id,
  })

export const useOrgTeam = (orgId) => {
  const qc = useQueryClient()
  const key = ['org-team', orgId]

  const team = useQuery({
    queryKey: key,
    queryFn: () => employeeService.getTeam(orgId).then(r => r.data.data),
    enabled: !!orgId,
  })

  const addMember = useMutation({
    mutationFn: (data) => employeeService.addTeamMember(orgId, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const removeMember = useMutation({
    mutationFn: (memberId) => employeeService.removeTeamMember(orgId, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { team, addMember, removeMember }
}

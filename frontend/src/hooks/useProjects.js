import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '../services/projectService'

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAll().then(res => res.data.data),
  })
}

export const useProject = (id) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getById(id).then(res => res.data.data),
    enabled: !!id,
  })
}

export const useProjectsByCustomer = (customerId) => {
  return useQuery({
    queryKey: ['projects', 'customer', customerId],
    queryFn: () => projectService.getByCustomer(customerId).then(res => res.data.data),
    enabled: !!customerId,
  })
}

export const useProjectsByStatus = (status) => {
  return useQuery({
    queryKey: ['projects', 'status', status],
    queryFn: () => projectService.getByStatus(status).then(res => res.data.data),
    enabled: !!status,
  })
}

export const useSearchProjects = (query) => {
  return useQuery({
    queryKey: ['projects', 'search', query],
    queryFn: () => projectService.search(query).then(res => res.data.data),
    enabled: query?.length >= 2,
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => projectService.create(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => projectService.update(id, data).then(res => res.data.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => projectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

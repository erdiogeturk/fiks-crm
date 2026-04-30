import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { activityService } from '../services/activityService'

export const useActivities = () => {
  return useQuery({
    queryKey: ['activities'],
    queryFn: () => activityService.getAll().then(res => res.data.data),
  })
}

export const useActivity = (id) => {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: () => activityService.getById(id).then(res => res.data.data),
    enabled: !!id,
  })
}

export const useActivitiesByCustomer = (customerId) => {
  return useQuery({
    queryKey: ['activities', 'customer', customerId],
    queryFn: () => activityService.getByCustomer(customerId).then(res => res.data.data),
    enabled: !!customerId,
  })
}

export const useCreateActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => activityService.create(data).then(res => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      if (variables.customerId) {
        queryClient.invalidateQueries({ queryKey: ['activities', 'customer', variables.customerId] })
      }
    },
  })
}

export const useUpdateActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => activityService.update(id, data).then(res => res.data.data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      if (updated.customerId) {
        queryClient.invalidateQueries({ queryKey: ['activities', 'customer', updated.customerId] })
      }
    },
  })
}

export const useDeleteActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }) => activityService.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      if (variables.customerId) {
        queryClient.invalidateQueries({ queryKey: ['activities', 'customer', variables.customerId] })
      }
    },
  })
}

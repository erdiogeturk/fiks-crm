import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerService } from '../services/customerService'

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll().then(res => res.data.data),
  })
}

export const useCustomer = (id) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getById(id).then(res => res.data.data),
    enabled: !!id,
  })
}

export const useSearchCustomers = (query) => {
  return useQuery({
    queryKey: ['customers', 'search', query],
    queryFn: () => customerService.search(query).then(res => res.data.data),
    enabled: query?.length >= 2,
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => customerService.create(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => customerService.update(id, data).then(res => res.data.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', id] })
    },
  })
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => customerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

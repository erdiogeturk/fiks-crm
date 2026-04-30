import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactService } from '../services/contactService'

export const useContactsByCustomer = (customerId) => {
  return useQuery({
    queryKey: ['contacts', 'customer', customerId],
    queryFn: () => contactService.getByCustomer(customerId).then(r => r.data.data),
    enabled: !!customerId,
  })
}

export const useCreateContact = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => contactService.create(data).then(r => r.data.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['contacts', 'customer', variables.customerId] })
    },
  })
}

export const useUpdateContact = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => contactService.update(id, data).then(r => r.data.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['contacts', 'customer', updated.customerId] })
    },
  })
}

export const useDeleteContact = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, customerId }) => contactService.delete(id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['contacts', 'customer', variables.customerId] })
    },
  })
}

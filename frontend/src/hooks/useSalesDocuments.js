import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesDocumentService } from '../services/salesDocumentService'

export const useSalesDocuments = () => {
  return useQuery({
    queryKey: ['sales-documents'],
    queryFn: () => salesDocumentService.getAll().then(r => r.data.data),
  })
}

export const useSalesDocument = (id) => {
  return useQuery({
    queryKey: ['sales-document', id],
    queryFn: () => salesDocumentService.getById(id).then(r => r.data.data),
    enabled: !!id,
  })
}

export const useSalesDocumentsByCustomer = (customerId) => {
  return useQuery({
    queryKey: ['sales-documents', 'customer', customerId],
    queryFn: () => salesDocumentService.getByCustomer(customerId).then(r => r.data.data),
    enabled: !!customerId,
  })
}

export const useCreateSalesDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => salesDocumentService.create(data).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-documents'] })
    },
  })
}

export const useUpdateSalesDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => salesDocumentService.update(id, data).then(r => r.data.data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['sales-documents'] })
      queryClient.invalidateQueries({ queryKey: ['sales-document', updated.id] })
    },
  })
}

export const useDeleteSalesDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => salesDocumentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-documents'] })
    },
  })
}

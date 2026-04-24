import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alanService } from '../services/alanService'

export const useColumns = (entityType) => {
  const qc = useQueryClient()
  const key = ['columns', entityType]

  const columns = useQuery({
    queryKey: key,
    queryFn: () => alanService.getColumns(entityType).then(r => r.data.data),
    enabled: !!entityType,
  })

  const deactivate = useMutation({
    mutationFn: (id) => alanService.deactivate(entityType, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const apply = useMutation({
    mutationFn: (data) => alanService.apply(entityType, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { columns, apply, deactivate }
}

export const usePreview = (entityType) =>
  useMutation({
    mutationFn: (data) => alanService.preview(entityType, data).then(r => r.data.data),
  })

import { useQuery } from '@tanstack/react-query'
import { schemaService } from '../services/schemaService'

export const useSchemaTables = () =>
  useQuery({
    queryKey: ['schema', 'tables'],
    queryFn: () => schemaService.getTables().then(r => r.data.data),
    staleTime: 5 * 60 * 1000, // cache 5 min
  })

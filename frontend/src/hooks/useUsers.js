import { useQuery } from '@tanstack/react-query'
import { userService } from '../services/userService'

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll().then(res => res.data.data),
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rolePermissionService } from '../services/rolePermissionService'

export const useRolePermissions = (roleType) =>
  useQuery({
    queryKey: ['role-permissions', roleType],
    queryFn: () => rolePermissionService.getByRole(roleType).then(r => r.data.data),
    enabled: !!roleType,
  })

export const useRoleTablePermissions = (roleType, tableName) =>
  useQuery({
    queryKey: ['role-permissions', roleType, tableName],
    queryFn: () => rolePermissionService.getByRoleAndTable(roleType, tableName).then(r => r.data.data),
    enabled: !!roleType && !!tableName,
  })

export const useSaveTablePermissions = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roleType, tableName, columns }) =>
      rolePermissionService
        .saveForTable(roleType, tableName, { roleType, tableName, columns })
        .then(r => r.data.data),
    onSuccess: (_, { roleType, tableName }) => {
      qc.invalidateQueries({ queryKey: ['role-permissions', roleType] })
      qc.invalidateQueries({ queryKey: ['role-permissions', roleType, tableName] })
    },
  })
}

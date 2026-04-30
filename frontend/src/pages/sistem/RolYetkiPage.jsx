import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Grid, Chip, Button, Select, MenuItem,
  IconButton, Divider, CircularProgress, Alert, Collapse,
  FormControl, Tooltip,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { useSchemaTables } from '../../hooks/useSchema'
import { useColumns } from '../../hooks/useAlans'
import { useRoleTablePermissions, useSaveTablePermissions } from '../../hooks/useRolePermissions'
import { useRoles } from '../../hooks/useRoles'

const SYSTEM_COLORS = {
  SUPER_ADMIN:   { color: '#7c3aed', bgColor: '#ede9fe' },
  COMPANY_ADMIN: { color: '#1d4ed8', bgColor: '#dbeafe' },
  SALES_PERSON:  { color: '#15803d', bgColor: '#dcfce7' },
  READ_ONLY:     { color: '#64748b', bgColor: '#f1f5f9' },
}

const CUSTOM_PALETTE = [
  { color: '#b45309', bgColor: '#fffbeb' },
  { color: '#be185d', bgColor: '#fdf2f8' },
  { color: '#0f766e', bgColor: '#f0fdfa' },
  { color: '#c2410c', bgColor: '#fff7ed' },
  { color: '#4338ca', bgColor: '#eef2ff' },
]

const getRoleColors = (name, index) =>
  SYSTEM_COLORS[name] ?? CUSTOM_PALETTE[index % CUSTOM_PALETTE.length]

const PERMISSION_OPTIONS = [
  { value: 'READ', label: 'Okuma', color: 'success' },
  { value: 'WRITE', label: 'Yazma', color: 'primary' },
  { value: 'NONE', label: 'Yok', color: 'default' },
]

// ── TableRow component ─────────────────────────────────────────────────────

const TablePermissionRow = ({ table, selectedRole, existingPermissions }) => {
  const [expanded, setExpanded] = useState(false)
  const [localPerms, setLocalPerms] = useState({})
  const [saved, setSaved] = useState(false)

  // Load column-level permissions for this table when expanded
  const { data: tablePerms, isLoading: permsLoading } = useRoleTablePermissions(
    expanded ? selectedRole : null,
    expanded ? table.tableName : null
  )

  // Load columns for this table when expanded
  const { columns } = useColumns(expanded ? table.tableName : null)

  const saveTablePermissions = useSaveTablePermissions()

  // Initialize localPerms from loaded permissions
  useEffect(() => {
    if (tablePerms && Array.isArray(tablePerms)) {
      const permsMap = {}
      tablePerms.forEach(p => {
        permsMap[p.columnName] = p.permission
      })
      setLocalPerms(permsMap)
      setSaved(false)
    }
  }, [tablePerms])

  const cols = columns.data || []

  const configuredCount = existingPermissions
    ? (Array.isArray(existingPermissions)
        ? existingPermissions.filter(p => p.tableName === table.tableName).length
        : 0)
    : 0

  const handleSetAll = (permission) => {
    const next = {}
    cols.forEach(c => { next[c.columnName] = permission })
    setLocalPerms(next)
    setSaved(false)
  }

  const handleSetColumn = (columnName, permission) => {
    setLocalPerms(prev => ({ ...prev, [columnName]: permission }))
    setSaved(false)
  }

  const handleSave = async () => {
    const columnsPayload = Object.entries(localPerms)
      .filter(([, perm]) => perm !== 'NONE')
      .map(([columnName, permission]) => ({ columnName, permission }))

    await saveTablePermissions.mutateAsync({
      roleType: selectedRole,
      tableName: table.tableName,
      columns: columnsPayload,
    })
    setSaved(true)
  }

  const getPermColor = (perm) => {
    if (perm === 'READ') return 'success'
    if (perm === 'WRITE') return 'primary'
    return 'default'
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 1,
        overflow: 'hidden',
        borderColor: expanded ? 'primary.main' : 'divider',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Table header row */}
      <Box
        onClick={() => setExpanded(p => !p)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          bgcolor: expanded ? 'primary.50' : 'transparent',
          '&:hover': { bgcolor: expanded ? 'primary.50' : 'action.hover' },
          transition: 'background-color 0.15s',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{table.displayName}</Typography>
          <Typography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'monospace' }}>
            {table.tableName}
          </Typography>
        </Box>
        {configuredCount > 0 && (
          <Chip
            label={`${configuredCount} kolon yapılandırıldı`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: 10, mr: 1 }}
          />
        )}
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Expanded content */}
      <Collapse in={expanded} timeout={200}>
        <Divider />
        <Box sx={{ p: 2 }}>
          {/* Bulk action buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mr: 1 }}>Toplu:</Typography>
            <Button size="small" variant="outlined" color="success" onClick={() => handleSetAll('READ')}
              sx={{ fontSize: 11, py: 0.25 }}>
              Tümünü READ
            </Button>
            <Button size="small" variant="outlined" color="primary" onClick={() => handleSetAll('WRITE')}
              sx={{ fontSize: 11, py: 0.25 }}>
              Tümünü WRITE
            </Button>
            <Button size="small" variant="outlined" color="inherit" onClick={() => handleSetAll('NONE')}
              sx={{ fontSize: 11, py: 0.25 }}>
              Tümünü NONE
            </Button>
            <Box sx={{ flex: 1 }} />
            {saved && (
              <Chip
                icon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                label="Kaydedildi"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontSize: 11 }}
              />
            )}
            <Button
              size="small"
              variant="contained"
              startIcon={saveTablePermissions.isPending ? <CircularProgress size={12} color="inherit" /> : <SaveIcon sx={{ fontSize: 14 }} />}
              onClick={handleSave}
              disabled={saveTablePermissions.isPending}
              sx={{ fontSize: 11 }}
            >
              Kaydet
            </Button>
          </Box>

          {/* Column permission rows */}
          {(permsLoading || columns.isLoading) ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : columns.isError ? (
            <Alert severity="error" sx={{ fontSize: 12 }}>Kolon bilgileri yüklenemedi.</Alert>
          ) : cols.length === 0 ? (
            <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center', py: 1 }}>
              Kolon bulunamadı.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {cols.map(col => {
                const perm = localPerms[col.columnName] || 'READ'
                return (
                  <Box
                    key={col.columnName}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1,
                      bgcolor: 'grey.50',
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{col.label || col.columnName}</Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.disabled', fontFamily: 'monospace' }}>
                        {col.columnName}
                      </Typography>
                    </Box>
                    <Chip
                      label={col.fieldType || col.dbDataType || '—'}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 10, color: 'text.secondary', borderColor: 'divider', minWidth: 60 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 110 }}>
                      <Select
                        value={perm}
                        onChange={(e) => handleSetColumn(col.columnName, e.target.value)}
                        sx={{
                          fontSize: 12,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: perm === 'WRITE' ? 'primary.main' : perm === 'READ' ? 'success.main' : 'divider',
                          },
                        }}
                      >
                        {PERMISSION_OPTIONS.map(opt => (
                          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 12 }}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )
              })}
            </Box>
          )}

          {saveTablePermissions.isError && (
            <Alert severity="error" sx={{ mt: 1.5, fontSize: 12 }}>
              Kaydedilemedi. Lütfen tekrar deneyin.
            </Alert>
          )}
        </Box>
      </Collapse>
    </Paper>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────

const RolYetkiPage = () => {
  const { roleType: urlRoleType } = useParams()
  const navigate = useNavigate()

  const [selectedRole, setSelectedRole] = useState(urlRoleType || null)
  const { data: schemaTables = [], isLoading: tablesLoading, isError: tablesError } = useSchemaTables()
  const { data: roles = [], isLoading: rolesLoading } = useRoles()

  // Sync URL param → state (if user navigates with a roleType in the URL)
  useEffect(() => {
    if (urlRoleType && urlRoleType !== selectedRole) {
      setSelectedRole(urlRoleType)
    }
  }, [urlRoleType]) // eslint-disable-line

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey)
    navigate(`/sistem/roller/yetki/${roleKey}`, { replace: true })
  }

  const selectedRoleMeta = roles.find(r => r.name === selectedRole)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Tooltip title="Rol Yönetimine Dön">
          <IconButton size="small" onClick={() => navigate('/sistem/roller')}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Rol Yetki Yönetimi
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            Rol bazında tablo ve kolon erişim izinlerini yapılandırın.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flex: 1, overflow: 'hidden' }}>
        {/* ── Left panel: Role selector ─────────────────────── */}
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            overflowY: 'auto',
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: 'text.disabled',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              mb: 0.5,
            }}
          >
            Roller
          </Typography>
          {rolesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={22} /></Box>
          ) : roles.map((role, i) => {
            const colors = getRoleColors(role.name, i)
            const isSelected = selectedRole === role.name
            return (
              <Paper
                key={role.id}
                onClick={() => handleSelectRole(role.name)}
                variant="outlined"
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderColor: isSelected ? colors.color : 'divider',
                  bgcolor: isSelected ? colors.bgColor : 'background.paper',
                  boxShadow: isSelected ? `0 0 0 2px ${colors.color}22` : 'none',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: colors.color, bgcolor: colors.bgColor },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36, height: 36, borderRadius: 1.5,
                      bgcolor: isSelected ? colors.color : `${colors.color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'background-color 0.15s',
                    }}
                  >
                    <AdminPanelSettingsIcon sx={{ fontSize: 18, color: isSelected ? '#fff' : colors.color }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: isSelected ? colors.color : 'text.primary' }}>
                      {role.label}
                    </Typography>
                    {role.description && (
                      <Typography sx={{ fontSize: 11, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {role.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            )
          })}
        </Box>

        {/* ── Right panel: Table permissions ────────────────── */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            minWidth: 0,
          }}
        >
          {!selectedRole ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 320,
                color: 'text.disabled',
                gap: 1.5,
              }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: 48, opacity: 0.25 }} />
              <Typography sx={{ fontSize: 14 }}>Yapılandırmak için sol taraftan bir rol seçin.</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'text.disabled',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                  }}
                >
                  {selectedRoleMeta?.label ?? selectedRole} — Tablo İzinleri
                </Typography>
                {tablesLoading && <CircularProgress size={14} />}
              </Box>

              {tablesError && (
                <Alert severity="error" sx={{ mb: 2 }}>Tablo listesi yüklenemedi.</Alert>
              )}

              {!tablesLoading && !tablesError && schemaTables.length === 0 && (
                <Alert severity="info">Henüz yapılandırılmış tablo bulunamadı.</Alert>
              )}

              {schemaTables.map(table => (
                <TablePermissionRow
                  key={table.tableName}
                  table={table}
                  selectedRole={selectedRole}
                  existingPermissions={null}
                />
              ))}
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default RolYetkiPage

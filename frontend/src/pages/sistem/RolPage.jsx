import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Grid, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  Select, MenuItem, FormControl, Tooltip, Switch,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useUsers, useRoleSummary } from '../../hooks/useUsers'
import { formatDate } from '../../utils/formatDate'

const ROLES = [
  {
    value: 'COMPANY_ADMIN',
    label: 'Şirket Yöneticisi',
    description: 'Tüm modüllere tam erişim. Kullanıcı ve ayar yönetimi yapabilir.',
    icon: AdminPanelSettingsIcon,
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    value: 'SALES_PERSON',
    label: 'Satış Temsilcisi',
    description: 'Müşteri, aktivite ve satış belgelerine erişim. Sistem ayarlarına erişemez.',
    icon: SupportAgentIcon,
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
  },
  {
    value: 'READ_ONLY',
    label: 'Salt Okunur',
    description: 'Tüm verileri görüntüleyebilir, düzenleme ve silme işlemi yapamaz.',
    icon: VisibilityIcon,
    color: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
  },
]

const roleMap = Object.fromEntries(ROLES.map(r => [r.value, r]))

const RoleChip = ({ role }) => {
  const r = roleMap[role]
  if (!r) return <Chip label={role} size="small" />
  return (
    <Chip
      label={r.label}
      size="small"
      sx={{ bgcolor: r.bg, color: r.color, fontWeight: 600, fontSize: 11, border: `1px solid ${r.border}` }}
    />
  )
}

const RolPage = () => {
  const navigate = useNavigate()
  const { list, update, toggleEnabled } = useUsers()
  const { data: summary, isLoading: summaryLoading } = useRoleSummary()
  const [selectedRole, setSelectedRole] = useState(null)

  const allUsers = list.data || []
  const displayed = selectedRole ? allUsers.filter(u => u.role === selectedRole) : allUsers

  const countFor = (role) => summary?.[role] ?? (allUsers.filter(u => u.role === role).length)

  const handleRoleChange = async (userId, newRole) => {
    const user = allUsers.find(u => u.id === userId)
    if (!user) return
    await update.mutateAsync({
      id: userId,
      data: {
        username:  user.username,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        phone:     user.phone,
        role:      newRole,
        enabled:   user.enabled,
      },
    })
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Yetkilendirme / Rol Yönetimi</Typography>

      {/* Role Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {ROLES.map(role => {
          const Icon = role.icon
          const count = countFor(role.value)
          const isSelected = selectedRole === role.value
          return (
            <Grid item xs={12} sm={4} key={role.value}>
              <Paper
                onClick={() => setSelectedRole(isSelected ? null : role.value)}
                sx={{
                  p: 2.5,
                  border: '2px solid',
                  borderColor: isSelected ? role.color : 'divider',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  bgcolor: isSelected ? role.bg : 'background.paper',
                  '&:hover': { borderColor: role.color, bgcolor: role.bg },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: role.bg, border: `1px solid ${role.border}` }}>
                    <Icon sx={{ fontSize: 20, color: role.color }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: role.color }}>{role.label}</Typography>
                  </Box>
                  <Box sx={{
                    minWidth: 32, height: 32, borderRadius: '50%',
                    bgcolor: role.bg, border: `1px solid ${role.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {summaryLoading
                      ? <CircularProgress size={14} />
                      : <Typography sx={{ fontSize: 13, fontWeight: 700, color: role.color }}>{count}</Typography>}
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12, lineHeight: 1.5 }}>
                  {role.description}
                </Typography>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      {/* User Table */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {selectedRole ? `${roleMap[selectedRole]?.label} Kullanıcıları` : 'Tüm Kullanıcılar'}
        </Typography>
        {selectedRole && (
          <Typography
            variant="caption"
            sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => setSelectedRole(null)}
          >
            Filtreyi Kaldır
          </Typography>
        )}
      </Box>

      {list.isError && <Alert severity="error" sx={{ mb: 2 }}>Veriler yüklenemedi.</Alert>}

      <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Kullanıcı Adı</TableCell>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Oluşturma</TableCell>
              <TableCell>Aktif</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.isLoading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : displayed.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>Kayıt bulunamadı.</TableCell></TableRow>
            ) : displayed.map(row => (
              <TableRow key={row.id} hover sx={{ opacity: row.enabled ? 1 : 0.5 }}>
                <TableCell>
                  <Typography
                    component="span"
                    onClick={() => navigate(`/sistem/kullanicilar/${row.id}`)}
                    sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 500, fontFamily: 'monospace', fontSize: 13, '&:hover': { textDecoration: 'underline' } }}
                  >
                    {row.username}
                  </Typography>
                </TableCell>
                <TableCell>{row.fullName}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{row.email || '—'}</TableCell>
                <TableCell>
                  <FormControl size="small" variant="standard" sx={{ minWidth: 160 }}>
                    <Select
                      value={row.role}
                      onChange={e => handleRoleChange(row.id, e.target.value)}
                      disableUnderline
                      renderValue={(v) => <RoleChip role={v} />}
                      sx={{ '& .MuiSelect-select': { py: 0 } }}
                    >
                      {ROLES.map(r => (
                        <MenuItem key={r.value} value={r.value}>
                          <RoleChip role={r.value} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{formatDate(row.createdAt) || '—'}</TableCell>
                <TableCell>
                  <Tooltip title={row.enabled ? 'Devre Dışı Bırak' : 'Aktif Et'}>
                    <Switch
                      size="small"
                      checked={row.enabled}
                      onChange={() => toggleEnabled.mutate(row.id)}
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
        {displayed.length} kayıt{selectedRole ? ` — ${roleMap[selectedRole]?.label}` : ''}
      </Typography>
    </Box>
  )
}

export default RolPage

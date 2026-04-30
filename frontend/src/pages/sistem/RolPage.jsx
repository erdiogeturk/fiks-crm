import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Grid, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  Select, MenuItem, FormControl, InputLabel, Tooltip, Switch, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SecurityIcon from '@mui/icons-material/Security'
import CloseIcon from '@mui/icons-material/Close'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { useUsers } from '../../hooks/useUsers'
import { useRoles, useCreateRole, useCopyRole } from '../../hooks/useRoles'
import { formatDate, formatDateTime } from '../../utils/formatDate'

// ── Role color palette cycling for custom roles ───────────────────────────

const SYSTEM_COLORS = {
  SUPER_ADMIN:   { color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd' },
  COMPANY_ADMIN: { color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  SALES_PERSON:  { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  READ_ONLY:     { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
}

const CUSTOM_PALETTE = [
  { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  { color: '#be185d', bg: '#fdf2f8', border: '#f9a8d4' },
  { color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
  { color: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
  { color: '#4338ca', bg: '#eef2ff', border: '#c7d2fe' },
]

const getRoleColors = (name, index) =>
  SYSTEM_COLORS[name] ?? CUSTOM_PALETTE[index % CUSTOM_PALETTE.length]

// ── RoleChip ──────────────────────────────────────────────────────────────

const RoleChip = ({ roleName, roleLabel, colors }) => (
  <Chip
    label={roleLabel || roleName}
    size="small"
    sx={{
      bgcolor: colors?.bg ?? '#f1f5f9',
      color: colors?.color ?? '#475569',
      fontWeight: 600,
      fontSize: 11,
      border: `1px solid ${colors?.border ?? '#e2e8f0'}`,
    }}
  />
)

// ── CreateRoleDialog ──────────────────────────────────────────────────────

const ROLE_STATUS_OPTIONS = ['Taslak', 'Aktif', 'Pasif']

const CreateRoleDialog = ({ open, onClose }) => {
  const create = useCreateRole()
  const [form, setForm] = useState({ name: '', label: '', description: '', status: 'Taslak' })
  const [error, setError] = useState('')

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.label.trim()) {
      setError('Ad ve Etiket zorunludur.')
      return
    }
    try {
      await create.mutateAsync(form)
      setForm({ name: '', label: '', description: '' })
      onClose()
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Kayıt başarısız.')
    }
  }

  const handleClose = () => {
    setForm({ name: '', label: '', description: '', status: 'Taslak' })
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Yeni Rol Oluştur</Typography>
        <IconButton size="small" onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <Alert severity="error" sx={{ fontSize: 12 }}>{error}</Alert>}
        <TextField
          label="Rol Adı (sistem anahtarı)"
          placeholder="Örn: MUHASEBE"
          value={form.name}
          onChange={handleChange('name')}
          size="small"
          fullWidth
          helperText="Büyük harf, boşluk yerine _ kullanın"
        />
        <TextField
          label="Görünen Etiket"
          placeholder="Örn: Muhasebe"
          value={form.label}
          onChange={handleChange('label')}
          size="small"
          fullWidth
        />
        <TextField
          label="Açıklama"
          value={form.description}
          onChange={handleChange('description')}
          size="small"
          fullWidth
          multiline
          rows={2}
        />
        <FormControl fullWidth size="small">
          <InputLabel>Durum</InputLabel>
          <Select value={form.status} label="Durum" onChange={handleChange('status')}>
            {ROLE_STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} size="small">İptal</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="small"
          disabled={create.isPending}
          startIcon={create.isPending ? <CircularProgress size={14} color="inherit" /> : null}
        >
          Oluştur
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ── CopyRoleDialog ────────────────────────────────────────────────────────

const CopyRoleDialog = ({ open, sourceRole, onClose }) => {
  const copy = useCopyRole()
  const [form, setForm] = useState({ name: '', label: '', description: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (sourceRole) {
      setForm({
        name:        `KOPYA_${sourceRole.name}`,
        label:       `${sourceRole.label} (Kopya)`,
        description: sourceRole.description || '',
        status:      'Taslak',
      })
      setError('')
    }
  }, [sourceRole])

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.label.trim()) { setError('Ad ve Etiket zorunludur.'); return }
    try {
      await copy.mutateAsync({ id: sourceRole.id, data: form })
      onClose()
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Kopyalama başarısız.')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Rolü Kopyala</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sourceRole && (
          <Alert severity="info" sx={{ fontSize: 12 }}>
            <strong>{sourceRole.label}</strong> rolü ve tüm alan yetkileri kopyalanacak.
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ fontSize: 12 }}>{error}</Alert>}
        <TextField
          label="Yeni Rol Adı (sistem anahtarı)"
          value={form.name}
          onChange={handleChange('name')}
          size="small"
          fullWidth
          helperText="Büyük harf, boşluk yerine _ kullanın"
        />
        <TextField
          label="Görünen Etiket"
          value={form.label}
          onChange={handleChange('label')}
          size="small"
          fullWidth
        />
        <TextField
          label="Açıklama"
          value={form.description}
          onChange={handleChange('description')}
          size="small"
          fullWidth
          multiline
          rows={2}
        />
        <FormControl fullWidth size="small">
          <InputLabel>Durum</InputLabel>
          <Select value={form.status} label="Durum" onChange={handleChange('status')}>
            {ROLE_STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small">İptal</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="small"
          disabled={copy.isPending}
          startIcon={copy.isPending ? <CircularProgress size={14} color="inherit" /> : <ContentCopyIcon fontSize="small" />}
        >
          Kopyala
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────

const RolPage = () => {
  const navigate = useNavigate()
  const { list, update, toggleEnabled } = useUsers()
  const { data: roles = [], isLoading: rolesLoading } = useRoles()
  const [selectedRole, setSelectedRole] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [copyTarget, setCopyTarget] = useState(null)

  const allUsers = list.data || []
  const displayed = selectedRole ? allUsers.filter(u => u.role === selectedRole) : allUsers

  const roleColorMap = Object.fromEntries(
    roles.map((r, i) => [r.name, getRoleColors(r.name, i)])
  )
  const roleLabelMap = Object.fromEntries(roles.map(r => [r.name, r.label]))

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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Yetkilendirme / Rol Yönetimi</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Yeni Rol
        </Button>
      </Box>

      {/* Role Cards */}
      {rolesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {roles.map((role, i) => {
            const colors = getRoleColors(role.name, i)
            const isSelected = selectedRole === role.name
            const count = allUsers.filter(u => u.role === role.name).length
            return (
              <Grid item xs={12} sm={6} md={4} key={role.id}>
                <Paper
                  onClick={() => setSelectedRole(isSelected ? null : role.name)}
                  sx={{
                    p: 2.5,
                    border: '2px solid',
                    borderColor: isSelected ? colors.color : 'divider',
                    boxShadow: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    bgcolor: isSelected ? colors.bg : 'background.paper',
                    '&:hover': { borderColor: colors.color, bgcolor: colors.bg },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: colors.bg, border: `1px solid ${colors.border}` }}>
                      <SecurityIcon sx={{ fontSize: 18, color: colors.color }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 13, color: colors.color, lineHeight: 1.2 }}>{role.label}</Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.disabled', fontFamily: 'monospace' }}>{role.name}</Typography>
                    </Box>
                    <Box sx={{
                      minWidth: 28, height: 28, borderRadius: '50%',
                      bgcolor: colors.bg, border: `1px solid ${colors.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.color }}>{count}</Typography>
                    </Box>
                  </Box>
                  {role.description && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 11, lineHeight: 1.5, mb: 1 }}>
                      {role.description}
                    </Typography>
                  )}

                  {/* Meta bilgiler */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mb: 1 }}>
                    {role.status && (
                      <Chip
                        label={role.status}
                        size="small"
                        sx={{
                          alignSelf: 'flex-start', height: 18, fontSize: 10, fontWeight: 600,
                          ...(role.status === 'Aktif'  ? { bgcolor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' } :
                              role.status === 'Pasif'  ? { bgcolor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' } :
                                                         { bgcolor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }),
                        }}
                      />
                    )}
                    {(role.createdAt || role.createdBy) && (
                      <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                        Oluşturan: <span style={{ color: '#64748b' }}>{role.createdBy || '—'}</span>
                        {role.createdAt && <span> · {formatDateTime(role.createdAt)}</span>}
                      </Typography>
                    )}
                    {(role.updatedAt || role.updatedBy) && (
                      <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                        Değiştiren: <span style={{ color: '#64748b' }}>{role.updatedBy || '—'}</span>
                        {role.updatedAt && <span> · {formatDateTime(role.updatedAt)}</span>}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {role.system && (
                      <Chip label="Sistem" size="small" sx={{ fontSize: 10, height: 18 }} />
                    )}
                    <Box sx={{ flex: 1 }} />
                    <Tooltip title="Rolü Kopyala">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); setCopyTarget(role) }}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <Typography
                      variant="caption"
                      onClick={(e) => { e.stopPropagation(); navigate(`/sistem/roller/yetki/${role.name}`) }}
                      sx={{ color: 'primary.main', cursor: 'pointer', fontSize: 11, '&:hover': { textDecoration: 'underline' } }}
                    >
                      Yetki Yönet →
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* User Table */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {selectedRole ? `${roleLabelMap[selectedRole] ?? selectedRole} Kullanıcıları` : 'Tüm Kullanıcılar'}
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
                      renderValue={(v) => (
                        <RoleChip roleName={v} roleLabel={roleLabelMap[v]} colors={roleColorMap[v]} />
                      )}
                      sx={{ '& .MuiSelect-select': { py: 0 } }}
                    >
                      {roles.map((r, i) => (
                        <MenuItem key={r.name} value={r.name}>
                          <RoleChip roleName={r.name} roleLabel={r.label} colors={getRoleColors(r.name, i)} />
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
        {displayed.length} kayıt{selectedRole ? ` — ${roleLabelMap[selectedRole] ?? selectedRole}` : ''}
      </Typography>

      <CreateRoleDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <CopyRoleDialog open={!!copyTarget} sourceRole={copyTarget} onClose={() => setCopyTarget(null)} />
    </Box>
  )
}

export default RolPage

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, Paper, Grid, Chip,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Alert, Tooltip, Switch, FormControlLabel,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useUser, useUsers } from '../../hooks/useUsers'
import { useRoles } from '../../hooks/useRoles'
import { formatDate } from '../../utils/formatDate'

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
const getRoleColors = (name, index) => SYSTEM_COLORS[name] ?? CUSTOM_PALETTE[index % CUSTOM_PALETTE.length]

const RoleChip = ({ role, roles = [] }) => {
  const idx   = roles.findIndex(r => r.name === role)
  const label = idx >= 0 ? roles[idx].label : role
  const c     = getRoleColors(role, idx >= 0 ? idx : 0)
  return <Chip label={label} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, fontSize: 11, border: `1px solid ${c.border}` }} />
}

const Field = ({ label, value, children }) => (
  <Box>
    <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
      {label}
    </Typography>
    {children || <Typography sx={{ fontSize: 14, color: value ? 'text.primary' : 'text.disabled' }}>{value || '—'}</Typography>}
  </Box>
)

const KullaniciDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: user, isLoading, isError, error } = useUser(id)
  const { update } = useUsers()
  const { data: roles = [] } = useRoles()

  const [editing, setEditing]     = useState(false)
  const [form, setForm]           = useState(null)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (user) {
      setForm({
        username:  user.username  || '',
        password:  '',
        firstName: user.firstName || '',
        lastName:  user.lastName  || '',
        email:     user.email     || '',
        phone:     user.phone     || '',
        role:      user.role      ?? '',
        enabled:   user.enabled   ?? true,
      })
    }
  }, [user])

  const handleEdit   = () => { setSaveError(null); setEditing(true) }
  const handleCancel = () => {
    setEditing(false)
    setSaveError(null)
    if (user) {
      setForm({
        username:  user.username  || '',
        password:  '',
        firstName: user.firstName || '',
        lastName:  user.lastName  || '',
        email:     user.email     || '',
        phone:     user.phone     || '',
        role:      user.role      ?? '',
        enabled:   user.enabled   ?? true,
      })
    }
  }

  const handleSave = async () => {
    setSaveError(null)
    try {
      await update.mutateAsync({
        id: Number(id),
        data: { ...form, password: form.password || undefined },
      })
      setEditing(false)
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Kayıt güncellenemedi.')
    }
  }

  const set      = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  const setCheck = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.checked }))

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
  if (isError)   return <Alert severity="error">{error?.message || 'Kullanıcı bulunamadı.'}</Alert>
  if (!user || !form) return null

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Tooltip title="Listeye Dön">
          <Button variant="outlined" size="small" color="inherit" onClick={() => navigate('/sistem/kullanicilar')}
            sx={{ minWidth: 0, px: 1.25, borderColor: 'divider' }}>
            <ArrowBackIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>{user.fullName}</Typography>
        <RoleChip role={user.role} roles={roles} />
        {!user.enabled && (
          <Chip label="Pasif" size="small" sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: 11, border: '1px solid #fecaca' }} />
        )}
        {!editing && (
          <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={handleEdit}>
            Düzenle
          </Button>
        )}
        {editing && (
          <Button variant="outlined" color="inherit" size="small" onClick={handleCancel}>İptal</Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: editing ? 'primary.light' : 'divider', boxShadow: 'none' }}>
        <Grid container spacing={3}>
          {/* Row 1 — credentials */}
          <Grid item xs={12} sm={6}>
            {editing
              ? <TextField label="Kullanıcı Adı" value={form.username} onChange={set('username')} required size="small" fullWidth />
              : <Field label="Kullanıcı Adı" value={user.username} />}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing
              ? <TextField label="Yeni Şifre" type="password" placeholder="Boş bırakırsanız değişmez" value={form.password} onChange={set('password')} size="small" fullWidth />
              : <Field label="Şifre" value="••••••••" />}
          </Grid>

          {/* Row 2 — name */}
          <Grid item xs={12} sm={6}>
            {editing
              ? <TextField label="Ad" value={form.firstName} onChange={set('firstName')} required size="small" fullWidth />
              : <Field label="Ad" value={user.firstName} />}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing
              ? <TextField label="Soyad" value={form.lastName} onChange={set('lastName')} required size="small" fullWidth />
              : <Field label="Soyad" value={user.lastName} />}
          </Grid>

          {/* Row 3 — contact */}
          <Grid item xs={12} sm={6}>
            {editing
              ? <TextField label="E-posta" type="email" value={form.email} onChange={set('email')} size="small" fullWidth />
              : <Field label="E-posta" value={user.email} />}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing
              ? <TextField label="Telefon" value={form.phone} onChange={set('phone')} size="small" fullWidth />
              : <Field label="Telefon" value={user.phone} />}
          </Grid>

          {/* Row 4 — role + status + created */}
          <Grid item xs={12} sm={4}>
            {editing
              ? (
                <FormControl fullWidth size="small">
                  <InputLabel>Rol</InputLabel>
                  <Select value={form.role} label="Rol" onChange={set('role')}>
                    <MenuItem value=""><em>— Rol Yok —</em></MenuItem>
                    {roles.map(r => <MenuItem key={r.name} value={r.name}>{r.label}</MenuItem>)}
                  </Select>
                </FormControl>
              )
              : <Field label="Rol"><RoleChip role={user.role} roles={roles} /></Field>}
          </Grid>
          <Grid item xs={12} sm={4}>
            {editing
              ? (
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>Durum</Typography>
                  <FormControlLabel
                    control={<Switch checked={form.enabled} onChange={setCheck('enabled')} size="small" />}
                    label={<Typography variant="body2">{form.enabled ? 'Aktif' : 'Pasif'}</Typography>}
                  />
                </Box>
              )
              : <Field label="Durum" value={user.enabled ? 'Aktif' : 'Pasif'} />}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Oluşturma Tarihi" value={formatDate(user.createdAt)} />
          </Grid>
        </Grid>

        {saveError && <Alert severity="error" sx={{ mt: 2.5 }}>{saveError}</Alert>}
      </Paper>

      {editing && (
        <Box sx={{ position: 'fixed', bottom: 28, right: 28, zIndex: 10 }}>
          <Button
            variant="contained" size="large" onClick={handleSave}
            disabled={!form.username || !form.firstName || !form.lastName || update.isPending}
            sx={{ px: 4, boxShadow: 4 }}
          >
            {update.isPending ? <CircularProgress size={20} /> : 'Kaydet'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default KullaniciDetail

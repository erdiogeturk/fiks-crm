import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Select, FormControl, InputLabel, CircularProgress, Alert, Tooltip, Switch,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import { useUsers } from '../../hooks/useUsers'
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

const EMPTY = { username: '', password: '', firstName: '', lastName: '', email: '', phone: '', role: '' }

const KullaniciPage = () => {
  const navigate = useNavigate()
  const { list, create, toggleEnabled, remove } = useUsers()
  const { data: roles = [] } = useRoles()
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(EMPTY)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = useMemo(() => {
    const rows = list.data || []
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.username?.toLowerCase().includes(q) ||
      r.firstName?.toLowerCase().includes(q) ||
      r.lastName?.toLowerCase().includes(q)  ||
      r.email?.toLowerCase().includes(q)
    )
  }, [list.data, search])

  const handleSave = async () => {
    await create.mutateAsync(form)
    setModal(false)
    setForm(EMPTY)
  }

  const handleDelete = async () => {
    await remove.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Kullanıcı Yönetimi</Typography>
        <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => { setForm(EMPTY); setModal(true) }}>
          Ekle
        </Button>
      </Box>

      <TextField
        size="small" placeholder="Ara..." value={search} onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 18 }} /> }}
        sx={{ mb: 2.5, width: 300 }}
      />

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
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.isLoading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Kayıt bulunamadı.</TableCell></TableRow>
            ) : filtered.map(row => (
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
                <TableCell><RoleChip role={row.role} roles={roles} /></TableCell>
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
                <TableCell align="right">
                  <Tooltip title="Sil">
                    <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>{filtered.length} kayıt</Typography>

      {/* Quick Entry Modal */}
      <Dialog open={modal} onClose={() => setModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Yeni Kullanıcı</DialogTitle>
        <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Kullanıcı Adı" value={form.username} onChange={set('username')} required size="small" fullWidth />
          <TextField label="Şifre" type="password" value={form.password} onChange={set('password')} required size="small" fullWidth />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Ad" value={form.firstName} onChange={set('firstName')} required size="small" fullWidth />
            <TextField label="Soyad" value={form.lastName} onChange={set('lastName')} required size="small" fullWidth />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="E-posta" type="email" value={form.email} onChange={set('email')} size="small" fullWidth />
            <TextField label="Telefon" value={form.phone} onChange={set('phone')} size="small" fullWidth />
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel>Rol</InputLabel>
            <Select value={form.role} label="Rol" onChange={set('role')}>
              <MenuItem value=""><em>— Rol Yok —</em></MenuItem>
              {roles.map(r => <MenuItem key={r.name} value={r.name}>{r.label}</MenuItem>)}
            </Select>
          </FormControl>
          {create.isError && (
            <Alert severity="error">{create.error?.response?.data?.message || 'Kayıt oluşturulamadı.'}</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setModal(false)} variant="outlined" color="inherit" size="small">İptal</Button>
          <Button
            onClick={handleSave} variant="contained" size="small"
            disabled={!form.username || !form.password || !form.firstName || !form.lastName || create.isPending}
          >
            {create.isPending ? <CircularProgress size={16} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Kullanıcıyı Sil</DialogTitle>
        <DialogContent><Typography>Bu kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz?</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" color="inherit" size="small">İptal</Button>
          <Button onClick={handleDelete} variant="contained" color="error" size="small" disabled={remove.isPending}>
            {remove.isPending ? <CircularProgress size={16} /> : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default KullaniciPage

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Select, FormControl, InputLabel, CircularProgress, Alert, Tooltip, Checkbox, FormControlLabel,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import { useEmployees } from '../../hooks/useEmployees'
import { formatDate } from '../../utils/formatDate'

const STATUS_OPTIONS = ['Aktif', 'Pasif']

const statusColor = {
  Aktif: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  Pasif: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
}

const StatusChip = ({ status }) => {
  const c = statusColor[status] || statusColor.Pasif
  return <Chip label={status} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, fontSize: 11, border: `1px solid ${c.border}` }} />
}

const EMPTY = {
  firstName: '', lastName: '', registrationNo: '', title: '', department: '',
  email: '', phone: '', startDate: '', status: 'Aktif',
  createUser: false, username: '', password: '',
}

const CalisanPage = () => {
  const navigate = useNavigate()
  const { list, create, remove } = useEmployees()
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(EMPTY)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = useMemo(() => {
    const rows = list.data || []
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.firstName?.toLowerCase().includes(q) ||
      r.lastName?.toLowerCase().includes(q)  ||
      r.email?.toLowerCase().includes(q)     ||
      r.department?.toLowerCase().includes(q)
    )
  }, [list.data, search])

  const handleSave = async () => {
    await create.mutateAsync({
      ...form,
      registrationNo: form.registrationNo ? Number(form.registrationNo) : null,
      startDate: form.startDate || null,
      createUser: form.createUser,
      username:  form.createUser ? form.username : undefined,
      password:  form.createUser ? form.password : undefined,
    })
    setModal(false)
    setForm(EMPTY)
  }

  const handleDelete = async () => {
    await remove.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  const setCheck = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.checked }))

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Çalışan Yönetimi</Typography>
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
              <TableCell>Ad Soyad</TableCell>
              <TableCell>Unvan</TableCell>
              <TableCell>Departman</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>İşe Başlama</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.isLoading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>Kayıt bulunamadı.</TableCell></TableRow>
            ) : filtered.map(row => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography
                    component="span"
                    onClick={() => navigate(`/sistem/calisanlar/${row.id}`)}
                    sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
                  >
                    {row.fullName}
                  </Typography>
                </TableCell>
                <TableCell>{row.title || '—'}</TableCell>
                <TableCell>{row.department || '—'}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{row.email || '—'}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{row.phone || '—'}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{formatDate(row.startDate) || '—'}</TableCell>
                <TableCell><StatusChip status={row.status} /></TableCell>
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
        <DialogTitle sx={{ fontWeight: 700 }}>Yeni Çalışan</DialogTitle>
        <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Ad" value={form.firstName} onChange={set('firstName')} required size="small" fullWidth />
            <TextField label="Soyad" value={form.lastName} onChange={set('lastName')} required size="small" fullWidth />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Sicil No" type="number" value={form.registrationNo} onChange={set('registrationNo')} size="small" fullWidth />
            <TextField label="Unvan" value={form.title} onChange={set('title')} size="small" fullWidth />
          </Box>
          <TextField label="Departman" value={form.department} onChange={set('department')} size="small" fullWidth />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="E-posta" type="email" value={form.email} onChange={set('email')} size="small" fullWidth />
            <TextField label="Telefon" value={form.phone} onChange={set('phone')} size="small" fullWidth />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="İşe Başlama" type="date" value={form.startDate} onChange={set('startDate')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            <FormControl fullWidth size="small">
              <InputLabel>Durum</InputLabel>
              <Select value={form.status} label="Durum" onChange={set('status')}>
                {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <FormControlLabel
            control={<Checkbox checked={form.createUser} onChange={setCheck('createUser')} size="small" />}
            label={<Typography variant="body2">Kullanıcı hesabı oluştur</Typography>}
          />
          {form.createUser && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Kullanıcı adı" value={form.username} onChange={set('username')} size="small" fullWidth required />
              <TextField label="Şifre" type="password" value={form.password} onChange={set('password')} size="small" fullWidth required />
            </Box>
          )}

          {create.isError && (
            <Alert severity="error">{create.error?.response?.data?.message || 'Kayıt oluşturulamadı.'}</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setModal(false)} variant="outlined" color="inherit" size="small">İptal</Button>
          <Button
            onClick={handleSave} variant="contained" size="small"
            disabled={!form.firstName || !form.lastName || (form.createUser && (!form.username || !form.password)) || create.isPending}
          >
            {create.isPending ? <CircularProgress size={16} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Çalışanı Sil</DialogTitle>
        <DialogContent><Typography>Bu çalışanı silmek istediğinize emin misiniz?</Typography></DialogContent>
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

export default CalisanPage

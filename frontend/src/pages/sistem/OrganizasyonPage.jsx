import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Select, FormControl, InputLabel, CircularProgress, Alert, Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import { useOrganizations } from '../../hooks/useOrganizations'
import { formatDate } from '../../utils/formatDate'

const STATUS_OPTIONS = ['Taslak', 'Aktif', 'Pasif']

const statusColor = { Aktif: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' }, Pasif: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' }, Taslak: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' } }

const StatusChip = ({ status }) => {
  const c = statusColor[status] || statusColor.Taslak
  return <Chip label={status} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, fontSize: 11, border: `1px solid ${c.border}` }} />
}

const EMPTY = { code: '', name: '', parentId: '', validFrom: '', validTo: '', status: 'Taslak' }

const OrganizasyonPage = () => {
  const navigate = useNavigate()
  const { list, searchHelp, create, remove } = useOrganizations()
  const [search, setSearch] = useState('')
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(EMPTY)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = useMemo(() => {
    const rows = list.data || []
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r => r.name?.toLowerCase().includes(q) || r.code?.toLowerCase().includes(q))
  }, [list.data, search])

  const handleSave = async () => {
    await create.mutateAsync({
      ...form,
      parentId: form.parentId || null,
      validFrom: form.validFrom || null,
      validTo:   form.validTo   || null,
    })
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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Organizasyon Yönetimi</Typography>
        <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => { setForm(EMPTY); setModal(true) }}>
          Ekle
        </Button>
      </Box>

      {/* Search */}
      <TextField
        size="small" placeholder="Ara..." value={search} onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 18 }} /> }}
        sx={{ mb: 2.5, width: 300 }}
      />

      {list.isError && <Alert severity="error" sx={{ mb: 2 }}>Veriler yüklenemedi.</Alert>}

      {/* Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Kod</TableCell>
              <TableCell>Tanım</TableCell>
              <TableCell>Bağlı Organizasyon</TableCell>
              <TableCell>Geçerlilik Başlangıcı</TableCell>
              <TableCell>Geçerlilik Bitişi</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Oluşturma Tarihi</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.isLoading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>Kayıt bulunamadı.</TableCell></TableRow>
            ) : filtered.map(row => (
              <TableRow
                key={row.id}
                hover
                onClick={() => navigate(`/sistem/organizasyon/${row.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.parentName || '—'}</TableCell>
                <TableCell>{formatDate(row.validFrom)}</TableCell>
                <TableCell>{formatDate(row.validTo)}</TableCell>
                <TableCell><StatusChip status={row.status} /></TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>{formatDate(row.createdAt)}</TableCell>
                <TableCell align="right" onClick={e => e.stopPropagation()}>
                  {!row.everActivated && (
                    <Tooltip title="Sil">
                      <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>{filtered.length} kayıt</Typography>

      {/* Quick Entry Modal */}
      <Dialog open={modal} onClose={() => setModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Yeni Organizasyon</DialogTitle>
        <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Organizasyon Kodu" value={form.code} onChange={set('code')} required size="small" fullWidth />
          <TextField label="Organizasyon Tanımı" value={form.name} onChange={set('name')} required size="small" fullWidth />
          <FormControl fullWidth size="small">
            <InputLabel>Bağlı Olduğu Organizasyon</InputLabel>
            <Select value={form.parentId} label="Bağlı Olduğu Organizasyon" onChange={set('parentId')}>
              <MenuItem value=""><em>—</em></MenuItem>
              {(searchHelp.data || []).map(o => (
                <MenuItem key={o.id} value={o.id}>{o.name} ({o.code})</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Geçerlilik Başlangıcı" type="date" value={form.validFrom} onChange={set('validFrom')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Geçerlilik Bitişi" type="date" value={form.validTo} onChange={set('validTo')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel>Durum</InputLabel>
            <Select value={form.status} label="Durum" onChange={set('status')}>
              {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          {create.isError && <Alert severity="error">{create.error?.response?.data?.message || 'Kayıt oluşturulamadı.'}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setModal(false)} variant="outlined" color="inherit" size="small">İptal</Button>
          <Button onClick={handleSave} variant="contained" size="small" disabled={!form.code || !form.name || create.isPending}>
            {create.isPending ? <CircularProgress size={16} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Organizasyonu Sil</DialogTitle>
        <DialogContent><Typography>Bu organizasyonu silmek istediğinize emin misiniz?</Typography></DialogContent>
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

export default OrganizasyonPage

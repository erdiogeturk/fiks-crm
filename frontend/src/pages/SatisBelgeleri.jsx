import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Button, IconButton, Chip,
  TextField, MenuItem, InputAdornment, CircularProgress, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Autocomplete,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'

import { useSalesDocuments, useCreateSalesDocument, useDeleteSalesDocument } from '../hooks/useSalesDocuments'
import { useCustomers } from '../hooks/useCustomers'
import { useContactsByCustomer } from '../hooks/useContacts'

// ── Constants ─────────────────────────────────────────────────────────────────

const DOC_TYPES = ['TEKLIF', 'SIPARIS', 'FATURA', 'PROFORMA']
const DOC_TYPE_LABELS = {
  TEKLIF: 'Teklif',
  SIPARIS: 'Sipariş',
  FATURA: 'Fatura',
  PROFORMA: 'Proforma',
}
const DOC_TYPE_COLORS = {
  TEKLIF: 'info',
  SIPARIS: 'warning',
  FATURA: 'success',
  PROFORMA: 'default',
}

const STATUSES = ['TASLAK', 'GONDERILDI', 'ONAYLANDI', 'REDDEDILDI', 'IPTAL']
const STATUS_LABELS = {
  TASLAK: 'Taslak',
  GONDERILDI: 'Gönderildi',
  ONAYLANDI: 'Onaylandı',
  REDDEDILDI: 'Reddedildi',
  IPTAL: 'İptal',
}
const STATUS_COLORS = {
  TASLAK: 'default',
  GONDERILDI: 'info',
  ONAYLANDI: 'success',
  REDDEDILDI: 'error',
  IPTAL: 'default',
}

const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP']

const emptyForm = {
  documentType: 'TEKLIF',
  customerId: null,
  contactId: null,
  documentDate: '',
  dueDate: '',
  currency: 'TRY',
  notes: '',
  status: 'TASLAK',
}

// ── Sub-component: ContactSelect ─────────────────────────────────────────────
// Loads contacts only when a customer is selected
function ContactSelect({ customerId, value, onChange }) {
  const { data: contacts = [] } = useContactsByCustomer(customerId)
  return (
    <TextField
      select
      label="İlgili Kişi (Opsiyonel)"
      fullWidth
      size="small"
      value={value || ''}
      onChange={e => onChange(e.target.value || null)}
      disabled={!customerId}
    >
      <MenuItem value="">— Seçiniz —</MenuItem>
      {contacts.map(c => (
        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
      ))}
    </TextField>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SatisBelgeleri() {
  const navigate = useNavigate()

  // List data
  const { data: documents = [], isLoading, error } = useSalesDocuments()
  const { data: customers = [] } = useCustomers()
  const createDoc = useCreateSalesDocument()
  const deleteDoc = useDeleteSalesDocument()

  // Filters
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // Delete confirm state
  const [deleteId, setDeleteId] = useState(null)

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = documents
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(d =>
        (d.documentNo || '').toLowerCase().includes(q) ||
        (d.customerName || '').toLowerCase().includes(q)
      )
    }
    if (filterStatus) result = result.filter(d => d.status === filterStatus)
    if (filterType) result = result.filter(d => d.documentType === filterType)
    return result
  }, [documents, search, filterStatus, filterType])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setForm(emptyForm)
    setSelectedCustomer(null)
    setCreateOpen(true)
  }

  const handleCreate = () => {
    if (!form.customerId) return
    createDoc.mutate(
      {
        ...form,
        documentDate: form.documentDate || null,
        dueDate: form.dueDate || null,
        items: [],
      },
      {
        onSuccess: (created) => {
          setCreateOpen(false)
          navigate(`/satis-belgeleri/${created.id}`)
        },
      }
    )
  }

  const handleDelete = () => {
    deleteDoc.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>Satış belgeleri yüklenemedi.</Alert>
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Satış Belgeleri</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Yeni Belge
        </Button>
      </Box>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              placeholder="Belge no veya müşteri ara..."
              size="small"
              fullWidth
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="Durum"
              size="small"
              fullWidth
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">Tümü</MenuItem>
              {STATUSES.map(s => (
                <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="Tip"
              size="small"
              fullWidth
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <MenuItem value="">Tümü</MenuItem>
              {DOC_TYPES.map(t => (
                <MenuItem key={t} value={t}>{DOC_TYPE_LABELS[t]}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={1}>
            <Typography variant="caption" color="text.secondary">
              {filtered.length} kayıt
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Belge No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Müşteri</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vade</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Toplam</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary', py: 5 }}>
                  Satış belgesi bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(doc => (
                <TableRow key={doc.id} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: 'primary.main', cursor: 'pointer' }}
                      onClick={() => navigate(`/satis-belgeleri/${doc.id}`)}
                    >
                      {doc.documentNo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={DOC_TYPE_LABELS[doc.documentType] || doc.documentType}
                      color={DOC_TYPE_COLORS[doc.documentType] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{doc.customerName}</TableCell>
                  <TableCell>{doc.documentDate || '—'}</TableCell>
                  <TableCell>{doc.dueDate || '—'}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {(doc.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {doc.currency}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABELS[doc.status] || doc.status}
                      color={STATUS_COLORS[doc.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/satis-belgeleri/${doc.id}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteId(doc.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Satış Belgesi</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Belge Tipi"
                fullWidth
                size="small"
                required
                value={form.documentType}
                onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}
              >
                {DOC_TYPES.map(t => (
                  <MenuItem key={t} value={t}>{DOC_TYPE_LABELS[t]}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Durum"
                fullWidth
                size="small"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                {STATUSES.map(s => (
                  <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={customers}
                getOptionLabel={c => c.name || ''}
                value={selectedCustomer}
                onChange={(_, val) => {
                  setSelectedCustomer(val)
                  setForm(f => ({ ...f, customerId: val?.id || null, contactId: null }))
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Müşteri" size="small" required />
                )}
                isOptionEqualToValue={(opt, val) => opt.id === val?.id}
              />
            </Grid>
            <Grid item xs={12}>
              <ContactSelect
                customerId={form.customerId}
                value={form.contactId}
                onChange={v => setForm(f => ({ ...f, contactId: v }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Belge Tarihi"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={form.documentDate}
                onChange={e => setForm(f => ({ ...f, documentDate: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vade Tarihi"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Para Birimi"
                fullWidth
                size="small"
                value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              >
                {CURRENCIES.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notlar"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!form.customerId || createDoc.isPending}
          >
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Belgeyi Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu satış belgesini silmek istediğinizden emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>İptal</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteDoc.isPending}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

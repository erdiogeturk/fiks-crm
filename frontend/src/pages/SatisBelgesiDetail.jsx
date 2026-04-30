import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Button, IconButton, Chip, Tab, Tabs,
  Grid, TextField, MenuItem, CircularProgress, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

import { useSalesDocument, useUpdateSalesDocument } from '../hooks/useSalesDocuments'

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

const emptyItemForm = {
  productName: '',
  description: '',
  quantity: '1',
  unitPrice: '0',
  discountRate: '0',
  unit: '',
}

// ── Helper ────────────────────────────────────────────────────────────────────

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null
}

function ViewField({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ mt: 0.25, minHeight: 22 }}>{value || '—'}</Typography>
    </Box>
  )
}

function computeLineTotal(qty, price, discount) {
  const q = parseFloat(qty) || 0
  const p = parseFloat(price) || 0
  const d = parseFloat(discount) || 0
  return q * p * (1 - d / 100)
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SatisBelgesiDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: doc, isLoading, error } = useSalesDocument(id)
  const updateDoc = useUpdateSalesDocument()

  const [tab, setTab] = useState(0)
  const [editing, setEditing] = useState(false)

  // Form state for header fields
  const [form, setForm] = useState({
    documentType: 'TEKLIF',
    documentDate: '',
    dueDate: '',
    currency: 'TRY',
    notes: '',
    status: 'TASLAK',
  })

  // Items local state
  const [items, setItems] = useState([])

  // Item dialog
  const [itemDialog, setItemDialog] = useState({ open: false, editIndex: null })
  const [itemForm, setItemForm] = useState(emptyItemForm)
  const [deleteItemIndex, setDeleteItemIndex] = useState(null)

  // Sync from fetched data when not editing
  useEffect(() => {
    if (doc && !editing) {
      setForm({
        documentType: doc.documentType || 'TEKLIF',
        documentDate: doc.documentDate || '',
        dueDate: doc.dueDate || '',
        currency: doc.currency || 'TRY',
        notes: doc.notes || '',
        status: doc.status || 'TASLAK',
      })
      setItems(
        (doc.items || []).map(item => ({
          id: item.id,
          productId: item.productId || null,
          productName: item.productName || '',
          description: item.description || '',
          quantity: String(item.quantity ?? 1),
          unitPrice: String(item.unitPrice ?? 0),
          discountRate: String(item.discountRate ?? 0),
          lineTotal: item.lineTotal ?? 0,
          unit: item.unit || '',
          sortOrder: item.sortOrder ?? 0,
        }))
      )
    }
  }, [doc, editing])

  // ── Item helpers ────────────────────────────────────────────────────────────

  const openAddItem = () => {
    setItemForm(emptyItemForm)
    setItemDialog({ open: true, editIndex: null })
  }

  const openEditItem = (index) => {
    const it = items[index]
    setItemForm({
      productName: it.productName,
      description: it.description || '',
      quantity: String(it.quantity),
      unitPrice: String(it.unitPrice),
      discountRate: String(it.discountRate),
      unit: it.unit || '',
    })
    setItemDialog({ open: true, editIndex: index })
  }

  const handleItemSave = () => {
    const lineTotal = computeLineTotal(itemForm.quantity, itemForm.unitPrice, itemForm.discountRate)
    const newItem = {
      productId: null,
      productName: itemForm.productName,
      description: itemForm.description,
      quantity: itemForm.quantity,
      unitPrice: itemForm.unitPrice,
      discountRate: itemForm.discountRate,
      lineTotal,
      unit: itemForm.unit,
      sortOrder: itemDialog.editIndex !== null ? items[itemDialog.editIndex].sortOrder : items.length,
    }

    if (itemDialog.editIndex !== null) {
      setItems(prev => prev.map((it, i) => (i === itemDialog.editIndex ? newItem : it)))
    } else {
      setItems(prev => [...prev, newItem])
    }
    setItemDialog({ open: false, editIndex: null })
  }

  const handleDeleteItem = () => {
    setItems(prev => prev.filter((_, i) => i !== deleteItemIndex))
    setDeleteItemIndex(null)
  }

  // ── Totals ──────────────────────────────────────────────────────────────────

  const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.lineTotal) || 0), 0)

  // ── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = () => {
    const payload = {
      documentType: form.documentType,
      documentDate: form.documentDate || null,
      dueDate: form.dueDate || null,
      customerId: doc.customerId,
      contactId: doc.contactId || null,
      status: form.status,
      currency: form.currency,
      notes: form.notes,
      items: items.map((it, i) => ({
        productId: it.productId || null,
        productName: it.productName,
        description: it.description || null,
        quantity: parseFloat(it.quantity) || 1,
        unitPrice: parseFloat(it.unitPrice) || 0,
        discountRate: parseFloat(it.discountRate) || 0,
        unit: it.unit || null,
        sortOrder: it.sortOrder ?? i,
      })),
    }

    updateDoc.mutate(
      { id: Number(id), data: payload },
      { onSuccess: () => setEditing(false) }
    )
  }

  const handleCancel = () => setEditing(false)

  // ── Loading/Error ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !doc) {
    return <Alert severity="error" sx={{ m: 3 }}>Satış belgesi bulunamadı.</Alert>
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate('/satis-belgeleri')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {doc.documentNo}
        </Typography>
        <Chip
          label={DOC_TYPE_LABELS[doc.documentType] || doc.documentType}
          color={DOC_TYPE_COLORS[doc.documentType] || 'default'}
          size="small"
          sx={{ mr: 0.5 }}
        />
        <Chip
          label={STATUS_LABELS[doc.status] || doc.status}
          color={STATUS_COLORS[doc.status] || 'default'}
          size="small"
          sx={{ mr: 1 }}
        />
        {!editing ? (
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditing(true)} size="small">
            Düzenle
          </Button>
        ) : (
          <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel} size="small" color="inherit">
            İptal
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Belge Bilgileri" />
          <Tab label={`Kalemler (${items.length})`} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* ── Tab 0: Belge Bilgileri ─────────────────────────────────── */}
          <TabPanel value={tab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    select
                    label="Belge Tipi"
                    fullWidth
                    size="small"
                    value={form.documentType}
                    onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}
                  >
                    {DOC_TYPES.map(t => (
                      <MenuItem key={t} value={t}>{DOC_TYPE_LABELS[t]}</MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <ViewField label="Belge Tipi" value={DOC_TYPE_LABELS[doc.documentType] || doc.documentType} />
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
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
                ) : (
                  <ViewField label="Durum" value={STATUS_LABELS[doc.status] || doc.status} />
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
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
                ) : (
                  <ViewField label="Para Birimi" value={doc.currency} />
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="Belge Tarihi"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={form.documentDate}
                    onChange={e => setForm(f => ({ ...f, documentDate: e.target.value }))}
                  />
                ) : (
                  <ViewField label="Belge Tarihi" value={doc.documentDate} />
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="Vade Tarihi"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  />
                ) : (
                  <ViewField label="Vade Tarihi" value={doc.dueDate} />
                )}
              </Grid>

              {/* Customer and contact are read-only (set at creation) */}
              <Grid item xs={12} sm={6} md={4}>
                <ViewField label="Müşteri" value={doc.customerName} />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <ViewField label="İlgili Kişi" value={doc.contactName} />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <ViewField label="Oluşturan" value={doc.createdByName} />
              </Grid>

              <Grid item xs={12}>
                {editing ? (
                  <TextField
                    label="Notlar"
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                ) : (
                  <ViewField label="Notlar" value={doc.notes} />
                )}
              </Grid>
            </Grid>
          </TabPanel>

          {/* ── Tab 1: Kalemler ───────────────────────────────────────── */}
          <TabPanel value={tab} index={1}>
            {editing && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<AddIcon />} size="small" onClick={openAddItem}>
                  Kalem Ekle
                </Button>
              </Box>
            )}

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: 40 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ürün Adı</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Miktar</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Birim</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Birim Fiyat</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">İskonto %</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Toplam</TableCell>
                    {editing && <TableCell sx={{ fontWeight: 600 }} align="right">İşlem</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={editing ? 9 : 8} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                        Kalem eklenmemiş
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{item.description || '—'}</TableCell>
                        <TableCell align="right">{parseFloat(item.quantity).toLocaleString('tr-TR')}</TableCell>
                        <TableCell>{item.unit || '—'}</TableCell>
                        <TableCell align="right">
                          {parseFloat(item.unitPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="right">
                          {parseFloat(item.discountRate) > 0 ? `%${item.discountRate}` : '—'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          {(parseFloat(item.lineTotal) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        {editing && (
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => openEditItem(index)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => setDeleteItemIndex(index)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}

                  {/* Totals row */}
                  {items.length > 0 && (
                    <>
                      <TableRow>
                        <TableCell colSpan={editing ? 7 : 6} />
                        <TableCell align="right" sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
                          <Typography variant="caption" color="text.secondary">Ara Toplam</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {form.currency || doc.currency}
                          </Typography>
                        </TableCell>
                        {editing && <TableCell />}
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={editing ? 7 : 6} />
                        <TableCell align="right">
                          <Typography variant="caption" color="text.secondary">Genel Toplam</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {form.currency || doc.currency}
                          </Typography>
                        </TableCell>
                        {editing && <TableCell />}
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Box>
      </Paper>

      {/* Fixed Save button */}
      {editing && (
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={updateDoc.isPending}
          sx={{ position: 'fixed', bottom: 28, right: 28, zIndex: 10 }}
        >
          Kaydet
        </Button>
      )}

      {/* Add/Edit Item Dialog */}
      <Dialog
        open={itemDialog.open}
        onClose={() => setItemDialog({ open: false, editIndex: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {itemDialog.editIndex !== null ? 'Kalemi Düzenle' : 'Kalem Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Ürün Adı"
                fullWidth
                size="small"
                required
                value={itemForm.productName}
                onChange={e => setItemForm(f => ({ ...f, productName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Açıklama"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={itemForm.description}
                onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Miktar"
                fullWidth
                size="small"
                type="number"
                inputProps={{ min: 0, step: '0.0001' }}
                value={itemForm.quantity}
                onChange={e => setItemForm(f => ({ ...f, quantity: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Birim"
                fullWidth
                size="small"
                value={itemForm.unit}
                onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Birim Fiyat"
                fullWidth
                size="small"
                type="number"
                inputProps={{ min: 0, step: '0.01' }}
                value={itemForm.unitPrice}
                onChange={e => setItemForm(f => ({ ...f, unitPrice: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="İskonto %"
                fullWidth
                size="small"
                type="number"
                inputProps={{ min: 0, max: 100, step: '0.01' }}
                value={itemForm.discountRate}
                onChange={e => setItemForm(f => ({ ...f, discountRate: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} sm={8}>
              <Box sx={{ pt: 1 }}>
                <Typography variant="caption" color="text.secondary">Hesaplanan Toplam</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {computeLineTotal(itemForm.quantity, itemForm.unitPrice, itemForm.discountRate)
                    .toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialog({ open: false, editIndex: null })}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleItemSave}
            disabled={!itemForm.productName}
          >
            {itemDialog.editIndex !== null ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Item Confirm */}
      <Dialog open={deleteItemIndex !== null} onClose={() => setDeleteItemIndex(null)} maxWidth="xs">
        <DialogTitle>Kalemi Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu kalemi silmek istediğinizden emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteItemIndex(null)}>İptal</Button>
          <Button variant="contained" color="error" onClick={handleDeleteItem}>Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

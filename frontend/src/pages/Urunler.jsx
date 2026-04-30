import { useState, useMemo } from 'react'
import {
  Box, Card, CardContent, Typography, TextField, InputAdornment,
  Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, Skeleton, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts'

const CURRENCY_OPTIONS = ['TRY', 'USD', 'EUR']

const STATUS_OPTIONS = [
  { value: 'Aktif', label: 'Aktif' },
  { value: 'Pasif', label: 'Pasif' },
]

const emptyForm = {
  name: '',
  code: '',
  category: '',
  unit: '',
  price: '',
  currency: 'TRY',
  status: 'Aktif',
  description: '',
}

const Urunler = () => {
  const { data: products, isLoading } = useProducts()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const filtered = useMemo(() => {
    if (!products) return []
    return products.filter(p => {
      const matchSearch = !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.code?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [products, search, statusFilter])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name || '',
      code: product.code || '',
      category: product.category || '',
      unit: product.unit || '',
      price: product.price != null ? String(product.price) : '',
      currency: product.currency || 'TRY',
      status: product.status || 'Aktif',
      description: product.description || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const payload = {
      ...form,
      price: form.price !== '' ? parseFloat(form.price) : null,
    }
    try {
      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, data: payload })
      } else {
        await createProduct.mutateAsync(payload)
      }
      setDialogOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(deleteConfirmId)
      setDeleteConfirmId(null)
    } catch (err) {
      console.error(err)
    }
  }

  const formatPrice = (price, currency) => {
    if (price == null) return '-'
    return `${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || ''}`
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Ürünler</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Yeni Ürün
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth size="small" placeholder="Ürün adı veya kodu ara..."
                value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField select fullWidth size="small" label="Durum" value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}>
                <MenuItem value="">Tümü</MenuItem>
                {STATUS_OPTIONS.map(s => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Kod</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Ürün Adı</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Kategori</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Birim</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Fiyat</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Para Birimi</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : filtered.map(product => (
                    <TableRow key={product.id} hover>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'primary.main' }}>
                        {product.code || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{product.name}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{product.category || '-'}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{product.unit || '-'}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        {product.price != null
                          ? product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{product.currency || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.status}
                          size="small"
                          color={product.status === 'Aktif' ? 'success' : 'default'}
                          sx={{ fontWeight: 600, fontSize: 11, height: 20 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(product)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteConfirmId(product.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              }
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Ürün bulunamadı
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Ürün Düzenle' : 'Yeni Ürün'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth size="small" label="Ürün Adı *"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth size="small" label="Kod"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="Kategori"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="Birim"
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth size="small" label="Fiyat" type="number"
                inputProps={{ min: 0, step: '0.01' }}
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth size="small" label="Para Birimi"
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}>
                {CURRENCY_OPTIONS.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField select fullWidth size="small" label="Durum"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map(s => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth size="small" label="Açıklama" multiline rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.name || createProduct.isPending || updateProduct.isPending}
          >
            {editingId ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Ürünü Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu ürünü silmek istediğinize emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>İptal</Button>
          <Button
            variant="contained" color="error"
            onClick={handleDelete}
            disabled={deleteProduct.isPending}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Urunler

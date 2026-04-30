import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Skeleton,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material'
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../hooks/useCustomers'

const AVATAR_COLORS = [
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#fef3c7', color: '#b45309' },
  { bg: '#ede9fe', color: '#7c3aed' },
  { bg: '#d1fae5', color: '#059669' },
  { bg: '#fee2e2', color: '#dc2626' },
  { bg: '#e0f2fe', color: '#0284c7' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#ccfbf1', color: '#0f766e' },
]

const getAvatarColor = (name = '') => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

const getInitials = (name = '') => {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

const initialForm = {
  name: '',
  customerType: 'Kurumsal Müşteri',
  status: 'Aktif',
  sector: '',
  country: 'Türkiye',
  phone: '',
  email: '',
  website: '',
  notes: '',
}

const Customers = () => {
  const navigate = useNavigate()
  const { data: customers, isLoading } = useCustomers()
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()
  const deleteCustomer = useDeleteCustomer()

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(initialForm)

  const filteredCustomers = customers?.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  ) || []

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      setEditId(customer.id)
      setForm({
        name: customer.name || '',
        customerType: customer.customerType || 'Kurumsal Müşteri',
        status: customer.status || 'Aktif',
        sector: customer.sector || '',
        country: customer.country || 'Türkiye',
        phone: customer.phone || '',
        email: customer.email || '',
        website: customer.website || '',
        notes: customer.notes || '',
      })
    } else {
      setEditId(null)
      setForm(initialForm)
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditId(null)
    setForm(initialForm)
  }

  const handleSubmit = async () => {
    try {
      if (editId) {
        await updateCustomer.mutateAsync({ id: editId, data: form })
      } else {
        await createCustomer.mutateAsync(form)
      }
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) {
      try {
        await deleteCustomer.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting customer:', error)
      }
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Müşteriler{' '}
            {!isLoading && (
              <Typography component="span" variant="body1" color="text.secondary" sx={{ fontWeight: 400 }}>
                · {customers?.length || 0} kayıt
              </Typography>
            )}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Yeni Müşteri
        </Button>
      </Box>

      {/* Search */}
      <TextField
        placeholder="Ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" sx={{ fontSize: 18 }} />
            </InputAdornment>
          ),
        }}
        size="small"
        sx={{ mb: 3, width: 320 }}
      />

      {/* Grid */}
      {isLoading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={72} />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 2,
            '@media (max-width: 1400px)': { gridTemplateColumns: 'repeat(4, 1fr)' },
            '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
            '@media (max-width: 700px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
            '@media (max-width: 400px)': { gridTemplateColumns: '1fr' },
          }}
        >
          {filteredCustomers.map((customer) => {
            const avatarColor = getAvatarColor(customer.name)
            return (
              <Box
                key={customer.id}
                sx={{ position: 'relative', '&:hover .card-actions': { opacity: 1 } }}
              >
                <Card
                  onClick={() => navigate(`/musteriler/${customer.id}`)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      '&:last-child': { pb: 2 },
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '8px',
                        bgcolor: avatarColor.bg,
                        color: avatarColor.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                        fontFamily: "'DM Sans', sans-serif",
                        letterSpacing: '0.5px',
                      }}
                    >
                      {getInitials(customer.name)}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}
                        noWrap
                      >
                        {customer.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.3 }}>
                        {customer.projectCount || 0} Proje
                        {customer.sector ? ` · ${customer.sector}` : ''}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Hover edit/delete */}
                <Box
                  className="card-actions"
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    opacity: 0,
                    transition: 'opacity 0.15s',
                    display: 'flex',
                    gap: 0.25,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(customer)}
                    sx={{
                      bgcolor: 'white',
                      boxShadow: 1,
                      width: 24,
                      height: 24,
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                  >
                    <EditIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(customer.id)}
                    sx={{
                      bgcolor: 'white',
                      boxShadow: 1,
                      width: 24,
                      height: 24,
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 13, color: 'error.main' }} />
                  </IconButton>
                </Box>
              </Box>
            )
          })}

          {filteredCustomers.length === 0 && (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <BusinessIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
              <Typography variant="h6">Müşteri bulunamadı</Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Müşteri Düzenle' : 'Yeni Müşteri'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Müşteri Adı"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Müşteri Tipi"
                  value={form.customerType}
                  onChange={(e) => setForm({ ...form, customerType: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="Kurumsal Müşteri">Kurumsal Müşteri</MenuItem>
                  <MenuItem value="Bireysel Müşteri">Bireysel Müşteri</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Durum"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="Aktif">Aktif</MenuItem>
                  <MenuItem value="Pasif">Pasif</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <TextField
              label="Sektör"
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="E-posta"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Telefon"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
            <TextField
              label="Web Sitesi"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              fullWidth
            />
            <TextField
              label="Notlar"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!form.name}>
            {editId ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Customers

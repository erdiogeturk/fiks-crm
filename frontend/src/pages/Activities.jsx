import { useState, useMemo } from 'react'
import {
  Box, Card, CardContent, Typography, TextField, InputAdornment,
  Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, Skeleton, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, Autocomplete,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity } from '../hooks/useActivities'
import { useCustomers } from '../hooks/useCustomers'
import { useUsers } from '../hooks/useUsers'
import { getUser } from '../services/authService'
import { contactService } from '../services/contactService'

const ACTIVITY_TYPES = [
  { value: 'ZIYARET', label: 'Ziyaret' },
  { value: 'GOREV', label: 'Görev' },
  { value: 'EPOSTA', label: 'E-Posta' },
  { value: 'TELEFON_ARAMASI', label: 'Telefon Araması' },
]

const STATUS_OPTIONS = [
  { value: 'ACIK', label: 'Açık' },
  { value: 'ISLENIYOR', label: 'İşleniyor' },
  { value: 'TAMAMLANDI', label: 'Tamamlandı' },
]

const statusConfig = {
  ACIK: { label: 'Açık', color: '#2563eb', bg: '#eff6ff' },
  ISLENIYOR: { label: 'İşleniyor', color: '#d97706', bg: '#fffbeb' },
  TAMAMLANDI: { label: 'Tamamlandı', color: '#059669', bg: '#ecfdf5' },
}

const typeConfig = {
  ZIYARET: { label: 'Ziyaret', color: '#7c3aed', bg: '#f5f3ff' },
  GOREV: { label: 'Görev', color: '#0284c7', bg: '#e0f2fe' },
  EPOSTA: { label: 'E-Posta', color: '#be185d', bg: '#fce7f3' },
  TELEFON_ARAMASI: { label: 'Telefon Araması', color: '#059669', bg: '#ecfdf5' },
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const emptyForm = {
  customerId: null,
  contactId: null,
  activityType: 'ZIYARET',
  name: '',
  status: 'ACIK',
  closeDate: '',
  location: '',
  notes: '',
  responsibleUserId: null,
}

const ContactAutocomplete = ({ customerId, value, onChange }) => {
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', 'customer', customerId],
    queryFn: () => contactService.getByCustomer(customerId).then(r => r.data.data),
    enabled: !!customerId,
  })

  return (
    <Autocomplete
      options={contacts}
      getOptionLabel={(o) => o.name || ''}
      value={contacts.find(c => c.id === value) || null}
      onChange={(_, v) => onChange(v ? v.id : null)}
      disabled={!customerId}
      renderInput={(params) => (
        <TextField {...params} label="İlgili Kişi" size="small"
          helperText={!customerId ? 'Önce müşteri seçin' : ''}
        />
      )}
    />
  )
}

const Activities = () => {
  const currentUser = getUser()
  const { data: activities, isLoading } = useActivities()
  const { data: customers = [] } = useCustomers()
  const { data: users = [] } = useUsers()
  const createActivity = useCreateActivity()
  const updateActivity = useUpdateActivity()
  const deleteActivity = useDeleteActivity()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const filtered = useMemo(() => {
    if (!activities) return []
    return activities.filter(a => {
      const matchSearch = !search ||
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        a.activityNumber?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || a.status === statusFilter
      const matchType = !typeFilter || a.activityType === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [activities, search, statusFilter, typeFilter])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (activity) => {
    setEditingId(activity.id)
    setForm({
      customerId: activity.customerId,
      contactId: activity.contactId || null,
      activityType: activity.activityType,
      name: activity.name,
      status: activity.status,
      closeDate: activity.closeDate || '',
      location: activity.location || '',
      notes: activity.notes || '',
      responsibleUserId: activity.responsibleUserId || null,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const payload = {
      ...form,
      closeDate: form.closeDate || null,
    }
    try {
      if (editingId) {
        await updateActivity.mutateAsync({ id: editingId, data: payload })
      } else {
        await createActivity.mutateAsync(payload)
      }
      setDialogOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteActivity.mutateAsync({ id: deleteConfirmId })
      setDeleteConfirmId(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Aktiviteler</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Yeni Aktivite
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth size="small" placeholder="Aktivite adı, müşteri veya numara ara..."
                value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField select fullWidth size="small" label="Durum" value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}>
                <MenuItem value="">Tümü</MenuItem>
                {STATUS_OPTIONS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField select fullWidth size="small" label="Aktivite Tipi" value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}>
                <MenuItem value="">Tümü</MenuItem>
                {ACTIVITY_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
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
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Aktivite No</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Adı</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Müşteri</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Tip</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Sorumlu</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Kapanış</TableCell>
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
                : filtered.map(activity => {
                    const sc = statusConfig[activity.status] || { label: activity.status, color: '#6b7280', bg: '#f3f4f6' }
                    const tc = typeConfig[activity.activityType] || { label: activity.activityType, color: '#6b7280', bg: '#f3f4f6' }
                    return (
                      <TableRow key={activity.id} hover>
                        <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'primary.main' }}>
                          {activity.activityNumber}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{activity.name}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{activity.customerName}</TableCell>
                        <TableCell>
                          <Chip label={tc.label} size="small"
                            sx={{ bgcolor: tc.bg, color: tc.color, fontWeight: 600, fontSize: 11, height: 20 }} />
                        </TableCell>
                        <TableCell>
                          <Chip label={sc.label} size="small"
                            sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: 11, height: 20 }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{activity.responsibleUserName || '-'}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{formatDate(activity.closeDate)}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(activity)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteConfirmId(activity.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })
              }
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Aktivite bulunamadı
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Aktivite Düzenle' : 'Yeni Aktivite'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={customers}
                getOptionLabel={(o) => o.name || ''}
                value={customers.find(c => c.id === form.customerId) || null}
                onChange={(_, v) => setForm({ ...form, customerId: v ? v.id : null, contactId: null })}
                disabled={!!editingId}
                renderInput={(params) => <TextField {...params} label="Müşteri *" size="small" />}
              />
            </Grid>
            <Grid item xs={12}>
              <ContactAutocomplete
                customerId={form.customerId}
                value={form.contactId}
                onChange={(v) => setForm({ ...form, contactId: v })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth size="small" label="Aktivite Tipi *"
                value={form.activityType}
                onChange={e => setForm({ ...form, activityType: e.target.value })}>
                {ACTIVITY_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth size="small" label="Durum"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Adı *"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Kapanış Tarihi" type="date"
                value={form.closeDate}
                onChange={e => setForm({ ...form, closeDate: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={users}
                getOptionLabel={(u) => u ? `${u.firstName} ${u.lastName}` : ''}
                value={users.find(u => u.id === form.responsibleUserId) || null}
                onChange={(_, v) => setForm({ ...form, responsibleUserId: v ? v.id : null })}
                renderInput={(params) => <TextField {...params} label="Sorumlu Çalışan" size="small" />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Yer / Konum"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notlar" multiline rows={3}
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Oluşturan" disabled
                value={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : ''} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button variant="contained"
            onClick={handleSave}
            disabled={!form.customerId || !form.name || !form.activityType || createActivity.isPending || updateActivity.isPending}>
            {editingId ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Aktiviteyi Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu aktiviteyi silmek istediğinize emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>İptal</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Activities

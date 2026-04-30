import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, Paper, Grid, Chip,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Alert, Tooltip, Autocomplete,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useQuery } from '@tanstack/react-query'
import { useActivity, useUpdateActivity } from '../hooks/useActivities'
import { useUsers } from '../hooks/useUsers'
import { contactService } from '../services/contactService'
import { formatDate } from '../utils/formatDate'

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

const Field = ({ label, value, children }) => (
  <Box>
    <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
      {label}
    </Typography>
    {children || <Typography sx={{ fontSize: 14, color: value ? 'text.primary' : 'text.disabled' }}>{value || '—'}</Typography>}
  </Box>
)

const ActivityDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: activity, isLoading, isError, error } = useActivity(id)
  const { list: usersQuery } = useUsers()
  const users = usersQuery.data || []
  const updateActivity = useUpdateActivity()

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', 'customer', activity?.customerId],
    queryFn: () => contactService.getByCustomer(activity.customerId).then(r => r.data.data),
    enabled: !!activity?.customerId,
  })

  const [editing, setEditing]     = useState(false)
  const [form, setForm]           = useState(null)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (activity) {
      setForm({
        customerId:        activity.customerId,
        contactId:         activity.contactId         || null,
        activityType:      activity.activityType      || 'ZIYARET',
        name:              activity.name              || '',
        status:            activity.status            || 'ACIK',
        closeDate:         activity.closeDate         || '',
        location:          activity.location          || '',
        notes:             activity.notes             || '',
        responsibleUserId: activity.responsibleUserId || null,
      })
    }
  }, [activity])

  const handleEdit   = () => { setSaveError(null); setEditing(true) }
  const handleCancel = () => {
    setEditing(false)
    setSaveError(null)
    if (activity) {
      setForm({
        customerId:        activity.customerId,
        contactId:         activity.contactId         || null,
        activityType:      activity.activityType      || 'ZIYARET',
        name:              activity.name              || '',
        status:            activity.status            || 'ACIK',
        closeDate:         activity.closeDate         || '',
        location:          activity.location          || '',
        notes:             activity.notes             || '',
        responsibleUserId: activity.responsibleUserId || null,
      })
    }
  }

  const handleSave = async () => {
    setSaveError(null)
    try {
      await updateActivity.mutateAsync({
        id: Number(id),
        data: { ...form, closeDate: form.closeDate || null },
      })
      setEditing(false)
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Kayıt güncellenemedi.')
    }
  }

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
  if (isError)   return <Alert severity="error">{error?.message || 'Aktivite bulunamadı.'}</Alert>
  if (!activity || !form) return null

  const sc = statusConfig[activity.status] || { label: activity.status, color: '#6b7280', bg: '#f3f4f6' }
  const typeLabel = ACTIVITY_TYPES.find(t => t.value === activity.activityType)?.label || activity.activityType

  return (
    <Box sx={{ pb: 10 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Tooltip title="Listeye Dön">
          <Button variant="outlined" size="small" color="inherit" onClick={() => navigate('/aktiviteler')}
            sx={{ minWidth: 0, px: 1.25, borderColor: 'divider' }}>
            <ArrowBackIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {activity.activityNumber}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>{activity.name}</Typography>
        <Chip label={sc.label} size="small"
          sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: 11 }} />
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
          {/* Row 1 — name + type + status */}
          <Grid item xs={12} sm={6}>
            {editing
              ? <TextField label="Adı *" value={form.name} onChange={set('name')} required size="small" fullWidth />
              : <Field label="Adı" value={activity.name} />}
          </Grid>
          <Grid item xs={12} sm={3}>
            {editing
              ? (
                <FormControl fullWidth size="small">
                  <InputLabel>Aktivite Tipi *</InputLabel>
                  <Select value={form.activityType} label="Aktivite Tipi *" onChange={set('activityType')}>
                    {ACTIVITY_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                  </Select>
                </FormControl>
              )
              : <Field label="Aktivite Tipi" value={typeLabel} />}
          </Grid>
          <Grid item xs={12} sm={3}>
            {editing
              ? (
                <FormControl fullWidth size="small">
                  <InputLabel>Durum</InputLabel>
                  <Select value={form.status} label="Durum" onChange={set('status')}>
                    {STATUS_OPTIONS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                  </Select>
                </FormControl>
              )
              : <Field label="Durum"><Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: 11 }} /></Field>}
          </Grid>

          {/* Row 2 — customer + contact */}
          <Grid item xs={12} sm={6}>
            <Field label="Müşteri" value={activity.customerName} />
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing
              ? (
                <Autocomplete
                  options={contacts}
                  getOptionLabel={(o) => o.name || ''}
                  value={contacts.find(c => c.id === form.contactId) || null}
                  onChange={(_, v) => setForm(p => ({ ...p, contactId: v ? v.id : null }))}
                  renderInput={(params) => <TextField {...params} label="İlgili Kişi" size="small" />}
                />
              )
              : <Field label="İlgili Kişi" value={activity.contactName} />}
          </Grid>

          {/* Row 3 — responsible + closeDate */}
          <Grid item xs={12} sm={6}>
            {editing
              ? (
                <Autocomplete
                  options={users}
                  getOptionLabel={(u) => u ? `${u.firstName} ${u.lastName}` : ''}
                  value={users.find(u => u.id === form.responsibleUserId) || null}
                  onChange={(_, v) => setForm(p => ({ ...p, responsibleUserId: v ? v.id : null }))}
                  renderInput={(params) => <TextField {...params} label="Sorumlu Kullanıcı" size="small" />}
                />
              )
              : <Field label="Sorumlu Kullanıcı" value={activity.responsibleUserName} />}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing
              ? <TextField label="Kapanış Tarihi" type="date" value={form.closeDate || ''} onChange={set('closeDate')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
              : <Field label="Kapanış Tarihi" value={formatDate(activity.closeDate)} />}
          </Grid>

          {/* Row 4 — location */}
          <Grid item xs={12}>
            {editing
              ? <TextField label="Yer / Konum" value={form.location} onChange={set('location')} size="small" fullWidth />
              : <Field label="Yer / Konum" value={activity.location} />}
          </Grid>

          {/* Row 5 — notes */}
          <Grid item xs={12}>
            {editing
              ? <TextField label="Notlar" value={form.notes} onChange={set('notes')} multiline rows={3} size="small" fullWidth />
              : <Field label="Notlar" value={activity.notes} />}
          </Grid>

          {/* Row 6 — audit */}
          <Grid item xs={12} sm={4}>
            <Field label="Oluşturan" value={activity.createdByName} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Oluşturma Tarihi" value={formatDate(activity.createdAt)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Değişiklik Tarihi" value={formatDate(activity.updatedAt)} />
          </Grid>
        </Grid>

        {saveError && <Alert severity="error" sx={{ mt: 2.5 }}>{saveError}</Alert>}
      </Paper>

      {editing && (
        <Box sx={{ position: 'fixed', bottom: 28, right: 28, zIndex: 10 }}>
          <Button
            variant="contained" size="large" onClick={handleSave}
            disabled={!form.name || !form.activityType || updateActivity.isPending}
            sx={{ px: 4, boxShadow: 4 }}
          >
            {updateActivity.isPending ? <CircularProgress size={20} /> : 'Kaydet'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default ActivityDetail

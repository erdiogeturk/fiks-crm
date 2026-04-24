import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, Paper, Grid, Chip,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Alert, Tooltip,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useEmployee, useEmployees } from '../../hooks/useEmployees'
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

const Field = ({ label, value, children }) => (
  <Box>
    <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
      {label}
    </Typography>
    {children || <Typography sx={{ fontSize: 14, color: value ? 'text.primary' : 'text.disabled' }}>{value || '—'}</Typography>}
  </Box>
)

const CalisanDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: emp, isLoading, isError, error } = useEmployee(id)
  const { update } = useEmployees()

  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState(null)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (emp) {
      setForm({
        firstName:      emp.firstName      || '',
        lastName:       emp.lastName       || '',
        registrationNo: emp.registrationNo || '',
        birthDate:      emp.birthDate      || '',
        startDate:      emp.startDate      || '',
        endDate:        emp.endDate        || '',
        email:          emp.email          || '',
        phone:          emp.phone          || '',
        department:     emp.department     || '',
        title:          emp.title          || '',
        status:         emp.status         || 'Aktif',
      })
    }
  }, [emp])

  const handleEdit   = () => { setSaveError(null); setEditing(true) }
  const handleCancel = () => {
    setEditing(false)
    setSaveError(null)
    if (emp) {
      setForm({
        firstName:      emp.firstName      || '',
        lastName:       emp.lastName       || '',
        registrationNo: emp.registrationNo || '',
        birthDate:      emp.birthDate      || '',
        startDate:      emp.startDate      || '',
        endDate:        emp.endDate        || '',
        email:          emp.email          || '',
        phone:          emp.phone          || '',
        department:     emp.department     || '',
        title:          emp.title          || '',
        status:         emp.status         || 'Aktif',
      })
    }
  }

  const handleSave = async () => {
    setSaveError(null)
    try {
      await update.mutateAsync({
        id: Number(id),
        data: {
          ...form,
          registrationNo: form.registrationNo ? Number(form.registrationNo) : null,
          birthDate:  form.birthDate  || null,
          startDate:  form.startDate  || null,
          endDate:    form.endDate    || null,
        },
      })
      setEditing(false)
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Kayıt güncellenemedi.')
    }
  }

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
  if (isError)   return <Alert severity="error">{error?.message || 'Çalışan bulunamadı.'}</Alert>
  if (!emp || !form) return null

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Tooltip title="Listeye Dön">
          <Button variant="outlined" size="small" color="inherit" onClick={() => navigate('/sistem/calisanlar')}
            sx={{ minWidth: 0, px: 1.25, borderColor: 'divider' }}>
            <ArrowBackIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>{emp.fullName}</Typography>
        <StatusChip status={emp.status} />
        {!editing && (
          <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={handleEdit}>
            Düzenle
          </Button>
        )}
        {editing && (
          <Button variant="outlined" color="inherit" size="small" onClick={handleCancel}>İptal</Button>
        )}
      </Box>

      {/* Info card */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: editing ? 'primary.light' : 'divider', boxShadow: 'none' }}>
        <Grid container spacing={3}>
          {/* Row 1 — name */}
          <Grid item xs={12} sm={4}>
            {editing
              ? <TextField label="Ad" value={form.firstName} onChange={set('firstName')} required size="small" fullWidth />
              : <Field label="Ad" value={emp.firstName} />}
          </Grid>
          <Grid item xs={12} sm={4}>
            {editing
              ? <TextField label="Soyad" value={form.lastName} onChange={set('lastName')} required size="small" fullWidth />
              : <Field label="Soyad" value={emp.lastName} />}
          </Grid>
          <Grid item xs={12} sm={4}>
            {editing
              ? <TextField label="Sicil No" type="number" value={form.registrationNo} onChange={set('registrationNo')} size="small" fullWidth />
              : <Field label="Sicil No" value={emp.registrationNo} />}
          </Grid>

          {/* Row 2 — job info */}
          <Grid item xs={12} sm={6}>
            {editing
              ? <TextField label="Unvan" value={form.title} onChange={set('title')} size="small" fullWidth />
              : <Field label="Unvan" value={emp.title} />}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing
              ? <TextField label="Departman" value={form.department} onChange={set('department')} size="small" fullWidth />
              : <Field label="Departman" value={emp.department} />}
          </Grid>

          {/* Row 3 — contact */}
          <Grid item xs={12} sm={6}>
            {editing
              ? <TextField label="E-posta" type="email" value={form.email} onChange={set('email')} size="small" fullWidth />
              : <Field label="E-posta" value={emp.email} />}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing
              ? <TextField label="Telefon" value={form.phone} onChange={set('phone')} size="small" fullWidth />
              : <Field label="Telefon" value={emp.phone} />}
          </Grid>

          {/* Row 4 — dates */}
          <Grid item xs={12} sm={4}>
            {editing
              ? <TextField label="Doğum Tarihi" type="date" value={form.birthDate || ''} onChange={set('birthDate')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
              : <Field label="Doğum Tarihi" value={formatDate(emp.birthDate)} />}
          </Grid>
          <Grid item xs={12} sm={4}>
            {editing
              ? <TextField label="İşe Başlama" type="date" value={form.startDate || ''} onChange={set('startDate')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
              : <Field label="İşe Başlama" value={formatDate(emp.startDate)} />}
          </Grid>
          <Grid item xs={12} sm={4}>
            {editing
              ? <TextField label="Ayrılış Tarihi" type="date" value={form.endDate || ''} onChange={set('endDate')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
              : <Field label="Ayrılış Tarihi" value={formatDate(emp.endDate)} />}
          </Grid>

          {/* Row 5 — status + meta */}
          <Grid item xs={12} sm={4}>
            {editing
              ? (
                <FormControl fullWidth size="small">
                  <InputLabel>Durum</InputLabel>
                  <Select value={form.status} label="Durum" onChange={set('status')}>
                    {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              )
              : <Field label="Durum"><StatusChip status={emp.status} /></Field>}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Bağlı Kullanıcı" value={emp.linkedUsername} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Oluşturma Tarihi" value={formatDate(emp.createdAt)} />
          </Grid>
        </Grid>

        {saveError && <Alert severity="error" sx={{ mt: 2.5 }}>{saveError}</Alert>}
      </Paper>

      {/* Fixed Save */}
      {editing && (
        <Box sx={{ position: 'fixed', bottom: 28, right: 28, zIndex: 10 }}>
          <Button
            variant="contained" size="large" onClick={handleSave}
            disabled={!form.firstName || !form.lastName || update.isPending}
            sx={{ px: 4, boxShadow: 4 }}
          >
            {update.isPending ? <CircularProgress size={20} /> : 'Kaydet'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default CalisanDetail

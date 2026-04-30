import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, Paper, Grid, Chip,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Alert, Autocomplete, Tooltip,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import { useOrgTeamMember } from '../../hooks/useEmployees'
import { useEmployees } from '../../hooks/useEmployees'
import { usePositions } from '../../hooks/useLookup'
import { formatDate } from '../../utils/formatDate'

const TEAM_ROLE_OPTIONS  = ['Yönetici', 'Çalışan']
const STATUS_OPTIONS     = ['Aktif', 'Pasif']

const Field = ({ label, value, children }) => (
  <Box>
    <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
      {label}
    </Typography>
    {children || <Typography sx={{ fontSize: 14, color: value ? 'text.primary' : 'text.disabled' }}>{value || '—'}</Typography>}
  </Box>
)

const OrgTeamMemberDetail = () => {
  const { orgId, memberId } = useParams()
  const navigate = useNavigate()

  const { data: query, update } = useOrgTeamMember(orgId, memberId)
  const { active } = useEmployees()
  const { list: positionList } = usePositions()

  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState(null)
  const [saveError, setSaveError] = useState(null)

  const member = query.data

  useEffect(() => {
    if (!member) return
    const allEmployees = active.data || []
    setForm({
      teamRole:  member.teamRole  || '',
      position:  positionList.data?.find(p => p.id === member.positionId) || null,
      status:    member.status    || 'Aktif',
      validFrom: member.validFrom || '',
      validTo:   member.validTo   || '',
      manager:   allEmployees.find(e => e.id === member.managerId) || null,
      joinedAt:  member.joinedAt  || '',
    })
  }, [member, active.data, positionList.data])

  const set = (field) => (val) => setForm(p => ({ ...p, [field]: val }))

  const handleSave = async () => {
    setSaveError(null)
    try {
      await update.mutateAsync({
        employeeId: member.employeeId,
        teamRole:   form.teamRole      || null,
        positionId: form.position?.id  || null,
        status:     form.status        || 'Aktif',
        validFrom:  form.validFrom     || null,
        validTo:    form.validTo       || null,
        managerId:  form.manager?.id   || null,
        joinedAt:   form.joinedAt      || null,
      })
      setEditing(false)
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Kayıt güncellenemedi.')
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setSaveError(null)
    if (member) {
      const allEmployees = active.data || []
      setForm({
        teamRole:  member.teamRole  || '',
        position:  positionList.data?.find(p => p.id === member.positionId) || null,
        status:    member.status    || 'Aktif',
        validFrom: member.validFrom || '',
        validTo:   member.validTo   || '',
        manager:   allEmployees.find(e => e.id === member.managerId) || null,
        joinedAt:  member.joinedAt  || '',
      })
    }
  }

  if (query.isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
  if (query.isError)   return <Alert severity="error">Ekip üyesi bulunamadı.</Alert>
  if (!member || !form) return null

  const allEmployees    = active.data || []
  const managerOptions  = allEmployees.filter(e => e.id !== member.employeeId)

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Tooltip title="Organizasyona Dön">
          <Button variant="outlined" size="small" color="inherit"
            onClick={() => navigate(`/sistem/organizasyon/${orgId}`)}
            sx={{ minWidth: 0, px: 1.25, borderColor: 'divider' }}>
            <ArrowBackIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{member.employeeFullName}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{member.employeeTitle || ''}</Typography>
        </Box>
        <Chip
          label={member.status}
          size="small"
          sx={member.status === 'Aktif'
            ? { bgcolor: '#ecfdf5', color: '#059669', fontWeight: 600, fontSize: 11, border: '1px solid #a7f3d0' }
            : { bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: 11, border: '1px solid #fecaca' }}
        />
        {!editing && (
          <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={() => { setSaveError(null); setEditing(true) }}>
            Düzenle
          </Button>
        )}
        {editing && (
          <Button variant="outlined" color="inherit" size="small" onClick={handleCancel}>İptal</Button>
        )}
      </Box>

      <Paper sx={{ p: 3, border: '1px solid', borderColor: editing ? 'primary.light' : 'divider', boxShadow: 'none' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Field label="Çalışan" value={member.employeeFullName} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="E-posta" value={member.employeeEmail} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Unvan" value={member.employeeTitle} />
          </Grid>

          <Grid item xs={12} sm={4}>
            {editing ? (
              <FormControl fullWidth size="small">
                <InputLabel>Rol</InputLabel>
                <Select value={form.teamRole} label="Rol" onChange={e => set('teamRole')(e.target.value)}>
                  <MenuItem value=""><em>—</em></MenuItem>
                  {TEAM_ROLE_OPTIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </Select>
              </FormControl>
            ) : (
              <Field label="Rol" value={member.teamRole} />
            )}
          </Grid>

          <Grid item xs={12} sm={4}>
            {editing ? (
              <Autocomplete
                options={positionList.data || []}
                getOptionLabel={p => p.name}
                value={form.position}
                onChange={(_, v) => set('position')(v)}
                size="small"
                renderInput={params => <TextField {...params} label="Pozisyon" />}
              />
            ) : (
              <Field label="Pozisyon" value={member.positionName} />
            )}
          </Grid>

          <Grid item xs={12} sm={4}>
            {editing ? (
              <Autocomplete
                options={managerOptions}
                getOptionLabel={e => `${e.fullName}${e.title ? ` — ${e.title}` : ''}`}
                value={form.manager}
                onChange={(_, v) => set('manager')(v)}
                size="small"
                renderInput={params => <TextField {...params} label="Yöneticisi" />}
              />
            ) : (
              <Field label="Yöneticisi" value={member.managerFullName} />
            )}
          </Grid>

          <Grid item xs={12} sm={4}>
            {editing ? (
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select value={form.status} label="Durum" onChange={e => set('status')(e.target.value)}>
                  {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            ) : (
              <Field label="Durum">
                <Chip
                  label={member.status}
                  size="small"
                  sx={member.status === 'Aktif'
                    ? { bgcolor: '#ecfdf5', color: '#059669', fontWeight: 600, fontSize: 11, border: '1px solid #a7f3d0' }
                    : { bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: 11, border: '1px solid #fecaca' }}
                />
              </Field>
            )}
          </Grid>

          <Grid item xs={12} sm={4}>
            {editing ? (
              <TextField label="Geçerlilik Başlangıcı" type="date" value={form.validFrom || ''} onChange={e => set('validFrom')(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            ) : (
              <Field label="Geçerlilik Başlangıcı" value={formatDate(member.validFrom)} />
            )}
          </Grid>

          <Grid item xs={12} sm={4}>
            {editing ? (
              <TextField label="Geçerlilik Bitişi" type="date" value={form.validTo || ''} onChange={e => set('validTo')(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            ) : (
              <Field label="Geçerlilik Bitişi" value={formatDate(member.validTo)} />
            )}
          </Grid>

          <Grid item xs={12} sm={4}>
            {editing ? (
              <TextField label="Katılım Tarihi" type="date" value={form.joinedAt || ''} onChange={e => set('joinedAt')(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            ) : (
              <Field label="Katılım Tarihi" value={formatDate(member.joinedAt)} />
            )}
          </Grid>
        </Grid>

        {saveError && <Alert severity="error" sx={{ mt: 2.5 }}>{saveError}</Alert>}
      </Paper>

      {editing && (
        <Box sx={{ position: 'fixed', bottom: 28, right: 28, zIndex: 10 }}>
          <Button
            variant="contained" size="large" onClick={handleSave}
            disabled={update.isPending}
            sx={{ px: 4, boxShadow: 4 }}
          >
            {update.isPending ? <CircularProgress size={20} /> : 'Kaydet'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default OrgTeamMemberDetail

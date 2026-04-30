import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, Paper, Grid, Chip,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Alert, Tabs, Tab, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Autocomplete,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useOrganization, useOrganizations } from '../../hooks/useOrganizations'
import { useEmployees, useOrgTeam } from '../../hooks/useEmployees'
import { usePositions } from '../../hooks/useLookup'
import { formatDate } from '../../utils/formatDate'

const STATUS_OPTIONS = ['Taslak', 'Aktif', 'Pasif']
const statusColor = { Aktif: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' }, Pasif: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' }, Taslak: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' } }

const StatusChip = ({ status }) => {
  const c = statusColor[status] || statusColor.Taslak
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

const TEAM_ROLE_OPTIONS = ['Yönetici', 'Çalışan']
const MEMBER_STATUS_OPTIONS = ['Aktif', 'Pasif']

const EMPTY_MEMBER = { employee: null, teamRole: '', position: null, status: 'Aktif', validFrom: '', validTo: '', manager: null, joinedAt: '' }

const EkipTab = ({ orgId }) => {
  const navigate = useNavigate()
  const { team, addMember, removeMember } = useOrgTeam(orgId)
  const { active } = useEmployees()
  const { list: positionList } = usePositions()
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(EMPTY_MEMBER)
  const [removeId, setRemoveId] = useState(null)
  const [addError, setAddError] = useState(null)

  const allEmployees = active.data || []
  const teamEmpIds   = new Set((team.data || []).map(m => m.employeeId))
  const available    = allEmployees.filter(e => !teamEmpIds.has(e.id))

  const set = (field) => (val) => setForm(p => ({ ...p, [field]: val }))

  const handleAdd = async () => {
    setAddError(null)
    try {
      await addMember.mutateAsync({
        employeeId: form.employee?.id,
        teamRole:   form.teamRole      || null,
        positionId: form.position?.id  || null,
        status:     form.status        || 'Aktif',
        validFrom:  form.validFrom || null,
        validTo:    form.validTo   || null,
        managerId:  form.manager?.id || null,
        joinedAt:   form.joinedAt  || null,
      })
      setModal(false)
      setForm(EMPTY_MEMBER)
    } catch (err) {
      setAddError(err?.response?.data?.message || 'Ekip üyesi eklenemedi.')
    }
  }

  const handleRemove = async () => {
    await removeMember.mutateAsync(removeId)
    setRemoveId(null)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => { setAddError(null); setForm(EMPTY_MEMBER); setModal(true) }}>
          Ekip Üyesi Ekle
        </Button>
      </Box>

      {team.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
      ) : (team.data || []).length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, color: 'text.disabled' }}>
          <Typography variant="body2">Ekipte henüz kimse yok.</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }}>#</TableCell>
                <TableCell>Ad Soyad</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Pozisyon</TableCell>
                <TableCell>Yöneticisi</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Geç. Başlangıç</TableCell>
                <TableCell>Geç. Bitiş</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {(team.data || []).map((m, idx) => (
                <TableRow
                  key={m.id}
                  hover
                  onClick={() => navigate(`/sistem/organizasyon/${orgId}/ekip/${m.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ color: 'text.disabled', fontSize: 12 }}>{idx + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{m.employeeFullName}</TableCell>
                  <TableCell>{m.teamRole || '—'}</TableCell>
                  <TableCell>{m.positionName || '—'}</TableCell>
                  <TableCell>{m.managerFullName || '—'}</TableCell>
                  <TableCell>
                    {m.status ? (
                      <Chip label={m.status} size="small" sx={m.status === 'Aktif'
                        ? { bgcolor: '#ecfdf5', color: '#059669', fontWeight: 600, fontSize: 11, border: '1px solid #a7f3d0' }
                        : { bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: 11, border: '1px solid #fecaca' }} />
                    ) : '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{formatDate(m.validFrom) || '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{formatDate(m.validTo) || '—'}</TableCell>
                  <TableCell align="right" onClick={e => e.stopPropagation()}>
                    <Tooltip title="Çıkar">
                      <IconButton size="small" color="error" onClick={() => setRemoveId(m.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add member dialog */}
      <Dialog open={modal} onClose={() => setModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Ekip Üyesi Ekle</DialogTitle>
        <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Autocomplete
            options={available}
            getOptionLabel={e => `${e.fullName}${e.title ? ` — ${e.title}` : ''}`}
            value={form.employee}
            onChange={(_, v) => set('employee')(v)}
            size="small"
            renderInput={params => <TextField {...params} label="Çalışan" required />}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Rol</InputLabel>
            <Select value={form.teamRole} label="Rol" onChange={e => set('teamRole')(e.target.value)}>
              {TEAM_ROLE_OPTIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
          <Autocomplete
            options={positionList.data || []}
            getOptionLabel={p => p.name}
            value={form.position}
            onChange={(_, v) => set('position')(v)}
            size="small"
            renderInput={params => <TextField {...params} label="Pozisyon" />}
          />
          <Autocomplete
            options={allEmployees.filter(e => e.id !== form.employee?.id)}
            getOptionLabel={e => `${e.fullName}${e.title ? ` — ${e.title}` : ''}`}
            value={form.manager}
            onChange={(_, v) => set('manager')(v)}
            size="small"
            renderInput={params => <TextField {...params} label="Yöneticisi" />}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Durum</InputLabel>
            <Select value={form.status} label="Durum" onChange={e => set('status')(e.target.value)}>
              {MEMBER_STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Geçerlilik Başlangıcı" type="date" value={form.validFrom} onChange={e => set('validFrom')(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Geçerlilik Bitişi" type="date" value={form.validTo} onChange={e => set('validTo')(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
          </Box>
          <TextField label="Katılım Tarihi" type="date" value={form.joinedAt} onChange={e => set('joinedAt')(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
          {addError && <Alert severity="error">{addError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setModal(false)} variant="outlined" color="inherit" size="small">İptal</Button>
          <Button onClick={handleAdd} variant="contained" size="small" disabled={!form.employee || addMember.isPending}>
            {addMember.isPending ? <CircularProgress size={16} /> : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove confirm */}
      <Dialog open={!!removeId} onClose={() => setRemoveId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Ekipten Çıkar</DialogTitle>
        <DialogContent><Typography>Bu çalışanı ekipten çıkarmak istiyor musunuz?</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setRemoveId(null)} variant="outlined" color="inherit" size="small">İptal</Button>
          <Button onClick={handleRemove} variant="contained" color="error" size="small" disabled={removeMember.isPending}>
            {removeMember.isPending ? <CircularProgress size={16} /> : 'Çıkar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

const OrganizasyonDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: org, isLoading, isError, error } = useOrganization(id)
  const { searchHelp, update } = useOrganizations()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (org) {
      setForm({
        code:      org.code      || '',
        name:      org.name      || '',
        parentId:  org.parentId  || '',
        validFrom: org.validFrom || '',
        validTo:   org.validTo   || '',
        status:    org.status    || 'Taslak',
      })
    }
  }, [org])

  const handleEdit = () => { setSaveError(null); setEditing(true) }

  const handleCancel = () => {
    setEditing(false)
    setSaveError(null)
    if (org) {
      setForm({
        code:      org.code      || '',
        name:      org.name      || '',
        parentId:  org.parentId  || '',
        validFrom: org.validFrom || '',
        validTo:   org.validTo   || '',
        status:    org.status    || 'Taslak',
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
          parentId:  form.parentId  || null,
          validFrom: form.validFrom || null,
          validTo:   form.validTo   || null,
        },
      })
      setEditing(false)
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Kayıt güncellenemedi.')
    }
  }

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
  if (isError) return <Alert severity="error">{error?.message || 'Organizasyon bulunamadı.'}</Alert>
  if (!org || !form) return null

  return (
    <Box sx={{ pb: 10 }}>
      {/* Page title row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Tooltip title="Listeye Dön">
          <Button variant="outlined" size="small" color="inherit" onClick={() => navigate('/sistem/organizasyon')}
            sx={{ minWidth: 0, px: 1.25, borderColor: 'divider' }}>
            <ArrowBackIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>{org.name}</Typography>
        <StatusChip status={org.status} />
        {!editing && (
          <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={handleEdit}>
            Düzenle
          </Button>
        )}
        {editing && (
          <Button variant="outlined" color="inherit" size="small" onClick={handleCancel}>İptal</Button>
        )}
      </Box>

      {/* Header card */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: editing ? 'primary.light' : 'divider', boxShadow: 'none' }}>
        <Grid container spacing={3}>
          {/* Row 1 */}
          <Grid item xs={12} sm={4}>
            {editing ? (
              <TextField label="Organizasyon Kodu" value={form.code} onChange={set('code')} required size="small" fullWidth />
            ) : (
              <Field label="Organizasyon Kodu" value={org.code} />
            )}
          </Grid>
          <Grid item xs={12} sm={8}>
            {editing ? (
              <TextField label="Organizasyon Tanımı" value={form.name} onChange={set('name')} required size="small" fullWidth />
            ) : (
              <Field label="Organizasyon Tanımı" value={org.name} />
            )}
          </Grid>

          {/* Row 2 */}
          <Grid item xs={12} sm={6}>
            {editing ? (
              <FormControl fullWidth size="small">
                <InputLabel>Bağlı Olduğu Organizasyon</InputLabel>
                <Select value={form.parentId} label="Bağlı Olduğu Organizasyon" onChange={set('parentId')}>
                  <MenuItem value=""><em>—</em></MenuItem>
                  {(searchHelp.data || [])
                    .filter(o => o.id !== Number(id))
                    .map(o => <MenuItem key={o.id} value={o.id}>{o.name} ({o.code})</MenuItem>)}
                </Select>
              </FormControl>
            ) : (
              <Field label="Bağlı Olduğu Organizasyon" value={org.parentName} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {editing ? (
              <FormControl fullWidth size="small">
                <InputLabel>Organizasyon Durumu</InputLabel>
                <Select value={form.status} label="Organizasyon Durumu" onChange={set('status')}>
                  {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            ) : (
              <Field label="Organizasyon Durumu"><StatusChip status={org.status} /></Field>
            )}
          </Grid>

          {/* Row 3 */}
          <Grid item xs={12} sm={4}>
            {editing ? (
              <TextField label="Geçerlilik Başlangıcı" type="date" value={form.validFrom || ''} onChange={set('validFrom')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            ) : (
              <Field label="Geçerlilik Başlangıcı" value={formatDate(org.validFrom)} />
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            {editing ? (
              <TextField label="Geçerlilik Bitişi" type="date" value={form.validTo || ''} onChange={set('validTo')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            ) : (
              <Field label="Geçerlilik Bitişi" value={formatDate(org.validTo)} />
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Oluşturma Tarihi" value={formatDate(org.createdAt)} />
          </Grid>
        </Grid>

        {saveError && <Alert severity="error" sx={{ mt: 2.5 }}>{saveError}</Alert>}
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 0 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Ekip" />
        </Tabs>
      </Box>

      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderTop: 'none', boxShadow: 'none', minHeight: 160 }}>
        {activeTab === 0 && <EkipTab orgId={Number(id)} />}
      </Paper>

      {/* Fixed Save button (bottom-right) — only in edit mode */}
      {editing && (
        <Box sx={{ position: 'fixed', bottom: 28, right: 28, zIndex: 10 }}>
          <Button
            variant="contained" size="large" onClick={handleSave}
            disabled={!form.code || !form.name || update.isPending}
            sx={{ px: 4, boxShadow: 4 }}
          >
            {update.isPending ? <CircularProgress size={20} /> : 'Kaydet'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default OrganizasyonDetail

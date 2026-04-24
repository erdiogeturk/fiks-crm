import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, Paper, Grid, Chip,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Alert, Tabs, Tab, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useOrganization, useOrganizations } from '../../hooks/useOrganizations'
import { useEmployees, useOrgTeam } from '../../hooks/useEmployees'
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

const EkipTab = ({ orgId }) => {
  const { team, addMember, removeMember } = useOrgTeam(orgId)
  const { active } = useEmployees()
  const [modal, setModal]     = useState(false)
  const [empId, setEmpId]     = useState('')
  const [teamRole, setTeamRole] = useState('')
  const [joinedAt, setJoinedAt] = useState('')
  const [removeId, setRemoveId] = useState(null)
  const [addError, setAddError] = useState(null)

  const handleAdd = async () => {
    setAddError(null)
    try {
      await addMember.mutateAsync({ employeeId: Number(empId), teamRole: teamRole || null, joinedAt: joinedAt || null })
      setModal(false); setEmpId(''); setTeamRole(''); setJoinedAt('')
    } catch (err) {
      setAddError(err?.response?.data?.message || 'Ekip üyesi eklenemedi.')
    }
  }

  const handleRemove = async () => {
    await removeMember.mutateAsync(removeId)
    setRemoveId(null)
  }

  // employees already in team
  const teamEmpIds = new Set((team.data || []).map(m => m.employeeId))
  const available = (active.data || []).filter(e => !teamEmpIds.has(e.id))

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => { setAddError(null); setModal(true) }}>
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
                <TableCell>Ad Soyad</TableCell>
                <TableCell>Unvan</TableCell>
                <TableCell>Departman</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Ekip Rolü</TableCell>
                <TableCell>Katılım Tarihi</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {(team.data || []).map(m => (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{m.employeeFullName}</TableCell>
                  <TableCell>{m.employeeTitle || '—'}</TableCell>
                  <TableCell>{m.employeeDepartment || '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{m.employeeEmail || '—'}</TableCell>
                  <TableCell>{m.teamRole || '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{formatDate(m.joinedAt) || '—'}</TableCell>
                  <TableCell align="right">
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
      <Dialog open={modal} onClose={() => setModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Ekip Üyesi Ekle</DialogTitle>
        <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormControl fullWidth size="small" required>
            <InputLabel>Çalışan</InputLabel>
            <Select value={empId} label="Çalışan" onChange={e => setEmpId(e.target.value)}>
              {available.map(e => <MenuItem key={e.id} value={e.id}>{e.fullName}{e.title ? ` — ${e.title}` : ''}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Ekip Rolü" value={teamRole} onChange={e => setTeamRole(e.target.value)} size="small" fullWidth />
          <TextField label="Katılım Tarihi" type="date" value={joinedAt} onChange={e => setJoinedAt(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
          {addError && <Alert severity="error">{addError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setModal(false)} variant="outlined" color="inherit" size="small">İptal</Button>
          <Button onClick={handleAdd} variant="contained" size="small" disabled={!empId || addMember.isPending}>
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

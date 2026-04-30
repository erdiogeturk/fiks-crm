import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Button, IconButton, Chip, Tab, Tabs,
  Grid, TextField, MenuItem, Divider, CircularProgress, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'

import { useCustomer, useUpdateCustomer } from '../hooks/useCustomers'
import { useContactsByCustomer, useCreateContact, useUpdateContact, useDeleteContact } from '../hooks/useContacts'
import { useActivitiesByCustomer, useCreateActivity, useDeleteActivity } from '../hooks/useActivities'
import { useUsers } from '../hooks/useUsers'

const CUSTOMER_TYPES = ['KURUMSAL', 'BIREYSEL']
const CUSTOMER_TYPE_LABELS = { KURUMSAL: 'Kurumsal', BIREYSEL: 'Bireysel' }
const ACTIVITY_TYPES = ['ZIYARET', 'GOREV', 'EPOSTA', 'TELEFON_ARAMASI']
const ACTIVITY_TYPE_LABELS = {
  ZIYARET: 'Ziyaret', GOREV: 'Görev', EPOSTA: 'E-posta', TELEFON_ARAMASI: 'Telefon Araması',
}
const ACTIVITY_STATUSES = ['ACIK', 'ISLENIYOR', 'TAMAMLANDI']
const ACTIVITY_STATUS_LABELS = { ACIK: 'Açık', ISLENIYOR: 'İşleniyor', TAMAMLANDI: 'Tamamlandı' }
const ACTIVITY_STATUS_COLORS = { ACIK: 'default', ISLENIYOR: 'warning', TAMAMLANDI: 'success' }

const emptyCustomerForm = {
  name: '', customerType: 'KURUMSAL', status: 'Aktif',
  customerNo: '', taxNo: '', taxOffice: '', sector: '', website: '', notes: '',
  phone: '', mobile: '', email: '',
  country: '', city: '', district: '', neighborhood: '', postalCode: '',
  billingAddress: '', shippingAddress: '',
}

const emptyContactForm = {
  name: '', title: '', email: '', phone: '', mobile: '', notes: '', isPrimary: false,
}

const emptyActivityForm = {
  name: '', activityType: 'ZIYARET', status: 'ACIK',
  closeDate: '', location: '', notes: '', responsibleUserId: '',
}

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

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(emptyCustomerForm)

  const [contactDialog, setContactDialog] = useState({ open: false, mode: 'create', data: null })
  const [deleteContactId, setDeleteContactId] = useState(null)
  const [deleteContactCustomerId, setDeleteContactCustomerId] = useState(null)

  const [activityDialog, setActivityDialog] = useState(false)
  const [activityForm, setActivityForm] = useState(emptyActivityForm)
  const [deleteActivityId, setDeleteActivityId] = useState(null)

  const { data: customer, isLoading, error } = useCustomer(id)
  const updateCustomer = useUpdateCustomer()
  const { data: contacts = [] } = useContactsByCustomer(id)
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const deleteContact = useDeleteContact()
  const { data: activities = [] } = useActivitiesByCustomer(id)
  const createActivity = useCreateActivity()
  const deleteActivity = useDeleteActivity()
  const { data: users = [] } = useUsers()

  useEffect(() => {
    if (customer && !editing) {
      setForm({
        name: customer.name || '',
        customerType: customer.customerType || 'KURUMSAL',
        status: customer.status || 'Aktif',
        customerNo: customer.customerNo || '',
        taxNo: customer.taxNo || '',
        taxOffice: customer.taxOffice || '',
        sector: customer.sector || '',
        website: customer.website || '',
        notes: customer.notes || '',
        phone: customer.phone || '',
        mobile: customer.mobile || '',
        email: customer.email || '',
        country: customer.country || '',
        city: customer.city || '',
        district: customer.district || '',
        neighborhood: customer.neighborhood || '',
        postalCode: customer.postalCode || '',
        billingAddress: customer.billingAddress || '',
        shippingAddress: customer.shippingAddress || '',
      })
    }
  }, [customer, editing])

  const handleSave = () => {
    updateCustomer.mutate(
      { id: Number(id), data: form },
      { onSuccess: () => setEditing(false) }
    )
  }

  const handleCancel = () => {
    setEditing(false)
  }

  // ── Contact dialog ──────────────────────────────────────────────
  const openCreateContact = () =>
    setContactDialog({ open: true, mode: 'create', data: { ...emptyContactForm } })

  const openEditContact = (contact) =>
    setContactDialog({ open: true, mode: 'edit', data: { ...contact } })

  const handleContactSave = () => {
    const { mode, data } = contactDialog
    if (mode === 'create') {
      createContact.mutate(
        { ...data, customerId: Number(id) },
        { onSuccess: () => setContactDialog({ ...contactDialog, open: false }) }
      )
    } else {
      updateContact.mutate(
        { id: data.id, data: { ...data, customerId: Number(id) } },
        { onSuccess: () => setContactDialog({ ...contactDialog, open: false }) }
      )
    }
  }

  const handleDeleteContact = () => {
    deleteContact.mutate(
      { id: deleteContactId, customerId: Number(id) },
      { onSuccess: () => { setDeleteContactId(null) } }
    )
  }

  // ── Activity dialog ─────────────────────────────────────────────
  const handleActivitySave = () => {
    createActivity.mutate(
      { ...activityForm, customerId: Number(id), responsibleUserId: activityForm.responsibleUserId || null },
      {
        onSuccess: () => {
          setActivityDialog(false)
          setActivityForm(emptyActivityForm)
        },
      }
    )
  }

  const handleDeleteActivity = () => {
    deleteActivity.mutate(
      { id: deleteActivityId, customerId: Number(id) },
      { onSuccess: () => setDeleteActivityId(null) }
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !customer) {
    return <Alert severity="error" sx={{ m: 3 }}>Müşteri bulunamadı.</Alert>
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/musteriler')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {customer.name}
        </Typography>
        <Chip
          label={customer.status}
          color={customer.status === 'Aktif' ? 'success' : 'default'}
          size="small"
          sx={{ mr: 1 }}
        />
        {!editing ? (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditing(true)}
            size="small"
          >
            Düzenle
          </Button>
        ) : (
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            size="small"
            color="inherit"
          >
            İptal
          </Button>
        )}
      </Box>

      {/* Tab panel */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Genel Bilgiler" />
          <Tab label="İletişim" />
          <Tab label={`İlgili Kişiler (${contacts.length})`} />
          <Tab label={`Aktiviteler (${activities.length})`} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* ── Tab 0: Genel Bilgiler ─────────────────────────────── */}
          <TabPanel value={tab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="Müşteri Adı"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    fullWidth size="small" required
                  />
                ) : (
                  <ViewField label="Müşteri Adı" value={customer.name} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="Müşteri No"
                    value={form.customerNo}
                    onChange={e => setForm(f => ({ ...f, customerNo: e.target.value }))}
                    fullWidth size="small"
                  />
                ) : (
                  <ViewField label="Müşteri No" value={customer.customerNo} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    select label="Müşteri Tipi"
                    value={form.customerType}
                    onChange={e => setForm(f => ({ ...f, customerType: e.target.value }))}
                    fullWidth size="small"
                  >
                    {CUSTOMER_TYPES.map(t => (
                      <MenuItem key={t} value={t}>{CUSTOMER_TYPE_LABELS[t]}</MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <ViewField label="Müşteri Tipi" value={CUSTOMER_TYPE_LABELS[customer.customerType]} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    select label="Durum"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    fullWidth size="small"
                  >
                    <MenuItem value="Aktif">Aktif</MenuItem>
                    <MenuItem value="Pasif">Pasif</MenuItem>
                  </TextField>
                ) : (
                  <ViewField label="Durum" value={customer.status} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="Vergi No"
                    value={form.taxNo}
                    onChange={e => setForm(f => ({ ...f, taxNo: e.target.value }))}
                    fullWidth size="small"
                  />
                ) : (
                  <ViewField label="Vergi No" value={customer.taxNo} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="Vergi Dairesi"
                    value={form.taxOffice}
                    onChange={e => setForm(f => ({ ...f, taxOffice: e.target.value }))}
                    fullWidth size="small"
                  />
                ) : (
                  <ViewField label="Vergi Dairesi" value={customer.taxOffice} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="Sektör"
                    value={form.sector}
                    onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                    fullWidth size="small"
                  />
                ) : (
                  <ViewField label="Sektör" value={customer.sector} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="Web Sitesi"
                    value={form.website}
                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    fullWidth size="small"
                  />
                ) : (
                  <ViewField label="Web Sitesi" value={customer.website} />
                )}
              </Grid>
              <Grid item xs={12}>
                {editing ? (
                  <TextField
                    label="Notlar"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    fullWidth size="small" multiline rows={3}
                  />
                ) : (
                  <ViewField label="Notlar" value={customer.notes} />
                )}
              </Grid>
            </Grid>
          </TabPanel>

          {/* ── Tab 1: İletişim ──────────────────────────────────── */}
          <TabPanel value={tab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="Telefon"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    fullWidth size="small"
                  />
                ) : (
                  <ViewField label="Telefon" value={customer.phone} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="Cep Telefonu"
                    value={form.mobile}
                    onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                    fullWidth size="small"
                  />
                ) : (
                  <ViewField label="Cep Telefonu" value={customer.mobile} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="E-posta"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    fullWidth size="small"
                  />
                ) : (
                  <ViewField label="E-posta" value={customer.email} />
                )}
              </Grid>
              <Grid item xs={12}><Divider /></Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="Ülke"
                    value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    fullWidth size="small"
                  />
                ) : (
                  <ViewField label="Ülke" value={customer.country} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="İl"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    fullWidth size="small"
                  />
                ) : (
                  <ViewField label="İl" value={customer.city} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="İlçe"
                    value={form.district}
                    onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                    fullWidth size="small"
                  />
                ) : (
                  <ViewField label="İlçe" value={customer.district} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="Mahalle"
                    value={form.neighborhood}
                    onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                    fullWidth size="small"
                  />
                ) : (
                  <ViewField label="Mahalle" value={customer.neighborhood} />
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {editing ? (
                  <TextField
                    label="Posta Kodu"
                    value={form.postalCode}
                    onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
                    fullWidth size="small"
                  />
                ) : (
                  <ViewField label="Posta Kodu" value={customer.postalCode} />
                )}
              </Grid>
              <Grid item xs={12}>
                {editing ? (
                  <TextField
                    label="Fatura Adresi"
                    value={form.billingAddress}
                    onChange={e => setForm(f => ({ ...f, billingAddress: e.target.value }))}
                    fullWidth size="small" multiline rows={2}
                  />
                ) : (
                  <ViewField label="Fatura Adresi" value={customer.billingAddress} />
                )}
              </Grid>
              <Grid item xs={12}>
                {editing ? (
                  <TextField
                    label="Teslimat Adresi"
                    value={form.shippingAddress}
                    onChange={e => setForm(f => ({ ...f, shippingAddress: e.target.value }))}
                    fullWidth size="small" multiline rows={2}
                  />
                ) : (
                  <ViewField label="Teslimat Adresi" value={customer.shippingAddress} />
                )}
              </Grid>
            </Grid>
          </TabPanel>

          {/* ── Tab 2: İlgili Kişiler ────────────────────────────── */}
          <TabPanel value={tab} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="outlined" startIcon={<AddIcon />} size="small" onClick={openCreateContact}>
                İlgili Kişi Ekle
              </Button>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ad Soyad</TableCell>
                    <TableCell>Ünvan</TableCell>
                    <TableCell>E-posta</TableCell>
                    <TableCell>Telefon</TableCell>
                    <TableCell align="center">Birincil</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                        İlgili kişi bulunamadı
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map(c => (
                      <TableRow key={c.id} hover>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.title || '—'}</TableCell>
                        <TableCell>{c.email || '—'}</TableCell>
                        <TableCell>{c.phone || c.mobile || '—'}</TableCell>
                        <TableCell align="center">
                          {c.isPrimary
                            ? <Tooltip title="Birincil kişi"><StarIcon color="warning" fontSize="small" /></Tooltip>
                            : <StarBorderIcon fontSize="small" color="disabled" />
                          }
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEditContact(c)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteContactId(c.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* ── Tab 3: Aktiviteler ───────────────────────────────── */}
          <TabPanel value={tab} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="outlined" startIcon={<AddIcon />} size="small" onClick={() => setActivityDialog(true)}>
                Aktivite Ekle
              </Button>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Ad</TableCell>
                    <TableCell>Tip</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Sorumlu</TableCell>
                    <TableCell>Bitiş Tarihi</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                        Aktivite bulunamadı
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities.map(a => (
                      <TableRow key={a.id} hover>
                        <TableCell>{a.activityNumber}</TableCell>
                        <TableCell>{a.name}</TableCell>
                        <TableCell>{ACTIVITY_TYPE_LABELS[a.activityType] || a.activityType}</TableCell>
                        <TableCell>
                          <Chip
                            label={ACTIVITY_STATUS_LABELS[a.status] || a.status}
                            color={ACTIVITY_STATUS_COLORS[a.status] || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{a.responsibleUserName || '—'}</TableCell>
                        <TableCell>{a.closeDate || '—'}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="error" onClick={() => setDeleteActivityId(a.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Box>
      </Paper>

      {/* Fixed save button */}
      {editing && (
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={updateCustomer.isPending}
          sx={{ position: 'fixed', bottom: 28, right: 28, zIndex: 10 }}
        >
          Kaydet
        </Button>
      )}

      {/* ── Contact Dialog ─────────────────────────────────────── */}
      <Dialog
        open={contactDialog.open}
        onClose={() => setContactDialog({ ...contactDialog, open: false })}
        maxWidth="sm" fullWidth
      >
        <DialogTitle>
          {contactDialog.mode === 'create' ? 'İlgili Kişi Ekle' : 'İlgili Kişi Düzenle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ad Soyad" required fullWidth size="small"
                value={contactDialog.data?.name || ''}
                onChange={e => setContactDialog(d => ({ ...d, data: { ...d.data, name: e.target.value } }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ünvan" fullWidth size="small"
                value={contactDialog.data?.title || ''}
                onChange={e => setContactDialog(d => ({ ...d, data: { ...d.data, title: e.target.value } }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="E-posta" fullWidth size="small"
                value={contactDialog.data?.email || ''}
                onChange={e => setContactDialog(d => ({ ...d, data: { ...d.data, email: e.target.value } }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefon" fullWidth size="small"
                value={contactDialog.data?.phone || ''}
                onChange={e => setContactDialog(d => ({ ...d, data: { ...d.data, phone: e.target.value } }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cep Telefonu" fullWidth size="small"
                value={contactDialog.data?.mobile || ''}
                onChange={e => setContactDialog(d => ({ ...d, data: { ...d.data, mobile: e.target.value } }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select label="Birincil Kişi" fullWidth size="small"
                value={contactDialog.data?.isPrimary ? 'true' : 'false'}
                onChange={e => setContactDialog(d => ({ ...d, data: { ...d.data, isPrimary: e.target.value === 'true' } }))}
              >
                <MenuItem value="true">Evet</MenuItem>
                <MenuItem value="false">Hayır</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notlar" fullWidth size="small" multiline rows={2}
                value={contactDialog.data?.notes || ''}
                onChange={e => setContactDialog(d => ({ ...d, data: { ...d.data, notes: e.target.value } }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialog({ ...contactDialog, open: false })}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleContactSave}
            disabled={createContact.isPending || updateContact.isPending}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Contact Confirm ─────────────────────────────── */}
      <Dialog open={!!deleteContactId} onClose={() => setDeleteContactId(null)} maxWidth="xs">
        <DialogTitle>İlgili Kişiyi Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu kişiyi silmek istediğinizden emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteContactId(null)}>İptal</Button>
          <Button
            variant="contained" color="error"
            onClick={handleDeleteContact}
            disabled={deleteContact.isPending}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Activity Create Dialog ─────────────────────────────── */}
      <Dialog open={activityDialog} onClose={() => setActivityDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Aktivite Ekle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Aktivite Adı" required fullWidth size="small"
                value={activityForm.name}
                onChange={e => setActivityForm(f => ({ ...f, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select label="Tip" fullWidth size="small"
                value={activityForm.activityType}
                onChange={e => setActivityForm(f => ({ ...f, activityType: e.target.value }))}
              >
                {ACTIVITY_TYPES.map(t => (
                  <MenuItem key={t} value={t}>{ACTIVITY_TYPE_LABELS[t]}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select label="Durum" fullWidth size="small"
                value={activityForm.status}
                onChange={e => setActivityForm(f => ({ ...f, status: e.target.value }))}
              >
                {ACTIVITY_STATUSES.map(s => (
                  <MenuItem key={s} value={s}>{ACTIVITY_STATUS_LABELS[s]}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Bitiş Tarihi" type="date" fullWidth size="small"
                InputLabelProps={{ shrink: true }}
                value={activityForm.closeDate}
                onChange={e => setActivityForm(f => ({ ...f, closeDate: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select label="Sorumlu" fullWidth size="small"
                value={activityForm.responsibleUserId}
                onChange={e => setActivityForm(f => ({ ...f, responsibleUserId: e.target.value }))}
              >
                <MenuItem value="">— Seçiniz —</MenuItem>
                {users.map(u => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.fullName || `${u.firstName} ${u.lastName}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Konum" fullWidth size="small"
                value={activityForm.location}
                onChange={e => setActivityForm(f => ({ ...f, location: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notlar" fullWidth size="small" multiline rows={2}
                value={activityForm.notes}
                onChange={e => setActivityForm(f => ({ ...f, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialog(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleActivitySave}
            disabled={createActivity.isPending}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Activity Confirm ────────────────────────────── */}
      <Dialog open={!!deleteActivityId} onClose={() => setDeleteActivityId(null)} maxWidth="xs">
        <DialogTitle>Aktiviteyi Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu aktiviteyi silmek istediğinizden emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteActivityId(null)}>İptal</Button>
          <Button
            variant="contained" color="error"
            onClick={handleDeleteActivity}
            disabled={deleteActivity.isPending}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

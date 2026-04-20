import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Grid,
  Skeleton,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useCustomer } from '../hooks/useCustomers'
import { useProjectsByCustomer, useCreateProject } from '../hooks/useProjects'
import { useActivitiesByCustomer, useCreateActivity, useDeleteActivity } from '../hooks/useActivities'
import { useUsers } from '../hooks/useUsers'

const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const statusConfig = {
  LEAD: { label: 'Lead', color: '#6366f1', bg: '#eef2ff' },
  PROPOSAL: { label: 'Teklif', color: '#f59e0b', bg: '#fffbeb' },
  NEGOTIATION: { label: 'Müzakere', color: '#3b82f6', bg: '#eff6ff' },
  WON: { label: 'Kazanıldı', color: '#10b981', bg: '#ecfdf5' },
  LOST: { label: 'Kaybedildi', color: '#ef4444', bg: '#fef2f2' },
  ONHOLD: { label: 'Beklemede', color: '#8b5cf6', bg: '#f5f3ff' },
}

const CustomerDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: customer, isLoading } = useCustomer(id)
  const { data: projects } = useProjectsByCustomer(id)
  const createProject = useCreateProject()
  const { data: activities = [] } = useActivitiesByCustomer(id)
  const { data: users = [] } = useUsers()
  const createActivityMutation = useCreateActivity()
  const deleteActivityMutation = useDeleteActivity()

  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [deleteActivityConfirmId, setDeleteActivityConfirmId] = useState(null)
  const [activityForm, setActivityForm] = useState({
    activityType: 'ZIYARET',
    name: '',
    status: 'ACIK',
    closeDate: '',
    location: '',
    notes: '',
    responsibleUserId: null,
  })

  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    amount: '',
    currency: 'EUR',
    status: 'LEAD',
    priority: 'MEDIUM',
    probability: 20,
    notes: '',
  })

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={300} />
      </Box>
    )
  }

  if (!customer) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Müşteri bulunamadı</Typography>
        <Button onClick={() => navigate('/customers')} sx={{ mt: 2 }}>
          Müşterilere Dön
        </Button>
      </Box>
    )
  }

  const handleCreateProject = async () => {
    try {
      await createProject.mutateAsync({
        customerId: customer.id,
        ...projectForm,
        amount: parseFloat(projectForm.amount),
      })
      setProjectDialogOpen(false)
      setProjectForm({
        projectName: '',
        amount: '',
        currency: 'EUR',
        status: 'LEAD',
        priority: 'MEDIUM',
        probability: 20,
        notes: '',
      })
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleCreateActivity = async () => {
    try {
      await createActivityMutation.mutateAsync({
        customerId: customer.id,
        contactId: null,
        ...activityForm,
        closeDate: activityForm.closeDate || null,
      })
      setActivityDialogOpen(false)
      setActivityForm({
        activityType: 'ZIYARET',
        name: '',
        status: 'ACIK',
        closeDate: '',
        location: '',
        notes: '',
        responsibleUserId: null,
      })
    } catch (error) {
      console.error('Error creating activity:', error)
    }
  }

  const handleDeleteActivity = async () => {
    try {
      await deleteActivityMutation.mutateAsync({ id: deleteActivityConfirmId, customerId: customer.id })
      setDeleteActivityConfirmId(null)
    } catch (error) {
      console.error('Error deleting activity:', error)
    }
  }

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/customers')}
        sx={{ mb: 2 }}
      >
        Müşterilere Dön
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Avatar
              src={customer.logoUrl}
              sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}
            >
              {customer.name?.[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {customer.name}
              </Typography>
              {customer.sector && (
                <Typography variant="body1" color="primary" sx={{ mt: 0.5 }}>
                  {customer.sector}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                {customer.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <EmailIcon fontSize="small" />
                    <Typography variant="body2">{customer.email}</Typography>
                  </Box>
                )}
                {customer.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <PhoneIcon fontSize="small" />
                    <Typography variant="body2">{customer.phone}</Typography>
                  </Box>
                )}
                {customer.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <BusinessIcon fontSize="small" />
                    <Typography variant="body2">{customer.website}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={customer.status || 'Aktif'} color="success" variant="outlined" />
              <Chip label={customer.customerType || 'Kurumsal'} variant="outlined" />
            </Box>
          </Box>

          {customer.notes && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {customer.notes}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Projeler ({projects?.length || 0})
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setProjectDialogOpen(true)}
            >
              Yeni Proje
            </Button>
          </Box>

          <List>
            {projects?.map((project, index) => {
              const status = statusConfig[project.status] || statusConfig.LEAD
              return (
                <Box key={project.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    onClick={() => navigate(`/projects/${project.id}`)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      py: 2,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {project.projectName}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {formatCurrency(project.amount, project.currency)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
                          <Chip
                            label={status.label}
                            size="small"
                            sx={{ bgcolor: status.bg, color: status.color, fontWeight: 600 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(project.date)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            %{project.probability}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </Box>
              )
            })}

            {(!projects || projects.length === 0) && (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography>Bu müşteriye ait proje bulunamadı</Typography>
              </Box>
            )}
          </List>
        </CardContent>
      </Card>

      {/* Aktiviteler */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Aktiviteler ({activities.length})
            </Typography>
            <Button size="small" startIcon={<AddIcon />} variant="outlined"
              onClick={() => setActivityDialogOpen(true)}>
              Aktivite Ekle
            </Button>
          </Box>

          {activities.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>No</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Adı</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Tip</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Durum</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Sorumlu</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Kapanış</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activities.map(activity => (
                    <TableRow key={activity.id} hover>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'primary.main' }}>
                        {activity.activityNumber}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{activity.name}</TableCell>
                      <TableCell>
                        <Chip label={
                          { ZIYARET: 'Ziyaret', GOREV: 'Görev', EPOSTA: 'E-Posta', TELEFON_ARAMASI: 'Telefon' }[activity.activityType] || activity.activityType
                        } size="small" variant="outlined" color="primary" sx={{ fontSize: 11, height: 20 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={
                          { ACIK: 'Açık', ISLENIYOR: 'İşleniyor', TAMAMLANDI: 'Tamamlandı' }[activity.status] || activity.status
                        } size="small" sx={{
                          fontSize: 11, height: 20,
                          bgcolor: activity.status === 'TAMAMLANDI' ? '#ecfdf5' : activity.status === 'ISLENIYOR' ? '#fffbeb' : '#eff6ff',
                          color: activity.status === 'TAMAMLANDI' ? '#059669' : activity.status === 'ISLENIYOR' ? '#d97706' : '#2563eb',
                        }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{activity.responsibleUserName || '-'}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        {activity.closeDate ? new Date(activity.closeDate).toLocaleDateString('tr-TR') : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error"
                          onClick={() => setDeleteActivityConfirmId(activity.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              Henüz aktivite yok
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Aktivite Oluşturma Dialog */}
      <Dialog open={activityDialogOpen} onClose={() => setActivityDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Aktivite Ekle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth size="small" label="Aktivite Tipi *"
                value={activityForm.activityType}
                onChange={e => setActivityForm({ ...activityForm, activityType: e.target.value })}>
                <MenuItem value="ZIYARET">Ziyaret</MenuItem>
                <MenuItem value="GOREV">Görev</MenuItem>
                <MenuItem value="EPOSTA">E-Posta</MenuItem>
                <MenuItem value="TELEFON_ARAMASI">Telefon Araması</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth size="small" label="Durum"
                value={activityForm.status}
                onChange={e => setActivityForm({ ...activityForm, status: e.target.value })}>
                <MenuItem value="ACIK">Açık</MenuItem>
                <MenuItem value="ISLENIYOR">İşleniyor</MenuItem>
                <MenuItem value="TAMAMLANDI">Tamamlandı</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Adı *"
                value={activityForm.name}
                onChange={e => setActivityForm({ ...activityForm, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Kapanış Tarihi" type="date"
                value={activityForm.closeDate}
                onChange={e => setActivityForm({ ...activityForm, closeDate: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={users}
                getOptionLabel={(u) => u ? `${u.firstName} ${u.lastName}` : ''}
                value={users.find(u => u.id === activityForm.responsibleUserId) || null}
                onChange={(_, v) => setActivityForm({ ...activityForm, responsibleUserId: v ? v.id : null })}
                renderInput={(params) => <TextField {...params} label="Sorumlu Çalışan" size="small" />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Yer / Konum"
                value={activityForm.location}
                onChange={e => setActivityForm({ ...activityForm, location: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notlar" multiline rows={3}
                value={activityForm.notes}
                onChange={e => setActivityForm({ ...activityForm, notes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialogOpen(false)}>İptal</Button>
          <Button variant="contained"
            onClick={handleCreateActivity}
            disabled={!activityForm.name}>
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={projectDialogOpen} onClose={() => setProjectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Proje</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Proje Adı"
              value={projectForm.projectName}
              onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })}
              required
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Tutar"
                  type="number"
                  value={projectForm.amount}
                  onChange={(e) => setProjectForm({ ...projectForm, amount: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Para Birimi"
                  value={projectForm.currency}
                  onChange={(e) => setProjectForm({ ...projectForm, currency: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="TRY">TRY</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Durum"
                  value={projectForm.status}
                  onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                  fullWidth
                >
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <MenuItem key={key} value={key}>{config.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Öncelik"
                  value={projectForm.priority}
                  onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="HIGH">Yüksek</MenuItem>
                  <MenuItem value="MEDIUM">Orta</MenuItem>
                  <MenuItem value="LOW">Düşük</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <TextField
              label="Olasılık (%)"
              type="number"
              value={projectForm.probability}
              onChange={(e) => setProjectForm({ ...projectForm, probability: parseInt(e.target.value) })}
              inputProps={{ min: 0, max: 100 }}
              fullWidth
            />
            <TextField
              label="Notlar"
              value={projectForm.notes}
              onChange={(e) => setProjectForm({ ...projectForm, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setProjectDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleCreateProject} disabled={!projectForm.projectName || !projectForm.amount}>
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteActivityConfirmId} onClose={() => setDeleteActivityConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Aktiviteyi Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu aktiviteyi silmek istediğinize emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteActivityConfirmId(null)}>İptal</Button>
          <Button variant="contained" color="error" onClick={handleDeleteActivity}>Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CustomerDetail

import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Skeleton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Autocomplete,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects'
import { useCustomers } from '../hooks/useCustomers'

const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

const formatDate = (date) => {
  if (!date) return '-'
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

const priorityConfig = {
  HIGH: { label: 'Yüksek', color: '#ef4444' },
  MEDIUM: { label: 'Orta', color: '#f59e0b' },
  LOW: { label: 'Düşük', color: '#6b7280' },
}

const initialForm = {
  customerId: null,
  projectName: '',
  amount: '',
  currency: 'EUR',
  status: 'LEAD',
  priority: 'MEDIUM',
  segment: '',
  source: '',
  probability: 20,
  contact: '',
  contactEmail: '',
  contactPhone: '',
  notes: '',
}

const Projects = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const statusFilter = searchParams.get('status')

  const { data: projects, isLoading } = useProjects()
  const { data: customers } = useCustomers()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(statusFilter || 'all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(initialForm)

  const filteredProjects = projects?.filter((p) => {
    const matchesSearch =
      p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = status === 'all' || p.status === status
    return matchesSearch && matchesStatus
  }) || []

  const handleOpenDialog = (project = null) => {
    if (project) {
      setEditId(project.id)
      setForm({
        customerId: project.customerId,
        projectName: project.projectName || '',
        amount: project.amount || '',
        currency: project.currency || 'EUR',
        status: project.status || 'LEAD',
        priority: project.priority || 'MEDIUM',
        segment: project.segment || '',
        source: project.source || '',
        probability: project.probability || 20,
        contact: project.contact || '',
        contactEmail: project.contactEmail || '',
        contactPhone: project.contactPhone || '',
        notes: project.notes || '',
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
      const data = {
        ...form,
        amount: parseFloat(form.amount),
      }
      if (editId) {
        await updateProject.mutateAsync({ id: editId, data })
      } else {
        await createProject.mutateAsync(data)
      }
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bu projeyi silmek istediğinize emin misiniz?')) {
      try {
        await deleteProject.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Projeler
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Proje
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Proje veya müşteri ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField
          select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">Tüm Durumlar</MenuItem>
          {Object.entries(statusConfig).map(([key, config]) => (
            <MenuItem key={key} value={key}>{config.label}</MenuItem>
          ))}
        </TextField>
      </Box>

      {isLoading ? (
        <Card>
          <CardContent sx={{ p: 0 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rounded" height={60} sx={{ mb: 1 }} />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Müşteri</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Proje</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Tutar</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Öncelik</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.map((project) => {
                  const status = statusConfig[project.status] || statusConfig.LEAD
                  const priority = priorityConfig[project.priority] || priorityConfig.MEDIUM
                  return (
                    <TableRow
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={project.customerLogoUrl}
                            sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                          >
                            {project.customerName?.[0]}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {project.customerName || '-'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {project.projectName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(project.amount, project.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(project.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status.label}
                          size="small"
                          sx={{ bgcolor: status.bg, color: status.color, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: priority.color, fontWeight: 600 }}>
                          {priority.label}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" onClick={() => handleOpenDialog(project)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(project.id)}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {filteredProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      Proje bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Proje Düzenle' : 'Yeni Proje'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Autocomplete
              options={customers || []}
              getOptionLabel={(option) => option.name || ''}
              value={customers?.find((c) => c.id === form.customerId) || null}
              onChange={(_, newValue) => setForm({ ...form, customerId: newValue?.id || null })}
              renderInput={(params) => (
                <TextField {...params} label="Müşteri" />
              )}
            />
            <TextField
              label="Proje Adı"
              value={form.projectName}
              onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Tutar"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Para Birimi"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="TRY">TRY</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  select
                  label="Durum"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  fullWidth
                >
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <MenuItem key={key} value={key}>{config.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  select
                  label="Öncelik"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="HIGH">Yüksek</MenuItem>
                  <MenuItem value="MEDIUM">Orta</MenuItem>
                  <MenuItem value="LOW">Düşük</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Olasılık (%)"
                  type="number"
                  value={form.probability}
                  onChange={(e) => setForm({ ...form, probability: parseInt(e.target.value) })}
                  inputProps={{ min: 0, max: 100 }}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Segment"
                  value={form.segment}
                  onChange={(e) => setForm({ ...form, segment: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Kaynak"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Kontak Kişi"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Kontak E-posta"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Kontak Telefon"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
            <TextField
              label="Notlar"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!form.projectName || !form.amount}>
            {editId ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Projects

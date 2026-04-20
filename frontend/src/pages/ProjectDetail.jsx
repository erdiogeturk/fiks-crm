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
  Chip,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import { useProject, useUpdateProject } from '../hooks/useProjects'

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
    month: 'long',
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

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(id)
  const updateProject = useUpdateProject()

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={300} />
      </Box>
    )
  }

  if (!project) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Proje bulunamadı</Typography>
        <Button onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          Projelere Dön
        </Button>
      </Box>
    )
  }

  const status = statusConfig[project.status] || statusConfig.LEAD
  const priority = priorityConfig[project.priority] || priorityConfig.MEDIUM

  const handleStatusChange = async (newStatus) => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: { ...project, status: newStatus },
      })
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/projects')}
        sx={{ mb: 2 }}
      >
        Projelere Dön
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar
                    src={project.customerLogoUrl}
                    sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
                  >
                    {project.customerName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {project.projectName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => navigate(`/customers/${project.customerId}`)}
                    >
                      {project.customerName || 'Müşteri atanmamış'}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {formatCurrency(project.amount, project.currency)}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <TextField
                    select
                    label="Durum"
                    value={project.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    fullWidth
                    size="small"
                  >
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <MenuItem key={key} value={key}>{config.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    select
                    label="Öncelik"
                    value={project.priority}
                    onChange={(e) => updateProject.mutateAsync({
                      id: project.id,
                      data: { ...project, priority: e.target.value },
                    })}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="HIGH">Yüksek</MenuItem>
                    <MenuItem value="MEDIUM">Orta</MenuItem>
                    <MenuItem value="LOW">Düşük</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Tarih"
                    value={project.date || ''}
                    onChange={(e) => updateProject.mutateAsync({
                      id: project.id,
                      data: { ...project, date: e.target.value },
                    })}
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Olasılık"
                    value={project.probability || 0}
                    onChange={(e) => updateProject.mutateAsync({
                      id: project.id,
                      data: { ...project, probability: parseInt(e.target.value) },
                    })}
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>

              {project.notes && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {project.notes}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Kontak Bilgileri
              </Typography>
              {project.contact ? (
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {project.contact}
                  </Typography>
                  {project.contactEmail && (
                    <Typography variant="body2" color="text.secondary">
                      ✉️ {project.contactEmail}
                    </Typography>
                  )}
                  {project.contactPhone && (
                    <Typography variant="body2" color="text.secondary">
                      📞 {project.contactPhone}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Kontak atanmamış
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Proje Detayları
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Segment</Typography>
                  <Typography variant="body2">{project.segment || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Kaynak</Typography>
                  <Typography variant="body2">{project.source || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Para Birimi</Typography>
                  <Typography variant="body2">{project.currency}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {project.nextAction && (
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Sonraki Aksiyon
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {project.nextAction}
                </Typography>
                {project.nextActionDate && (
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(project.nextActionDate)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

    </Box>
  )
}

export default ProjectDetail

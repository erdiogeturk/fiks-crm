import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  DragIndicator as DragIcon,
} from '@mui/icons-material'
import { useProjects, useUpdateProject } from '../hooks/useProjects'

const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

const statusConfig = {
  LEAD: { label: 'Lead', color: '#6366f1', bg: '#eef2ff', border: '#6366f133' },
  PROPOSAL: { label: 'Teklif', color: '#f59e0b', bg: '#fffbeb', border: '#f59e0b33' },
  NEGOTIATION: { label: 'Müzakere', color: '#3b82f6', bg: '#eff6ff', border: '#3b82f633' },
  WON: { label: 'Kazanıldı', color: '#10b981', bg: '#ecfdf5', border: '#10b98133' },
  LOST: { label: 'Kaybedildi', color: '#ef4444', bg: '#fef2f2', border: '#ef444433' },
  ONHOLD: { label: 'Beklemede', color: '#8b5cf6', bg: '#f5f3ff', border: '#8b5cf633' },
}

const columns = ['LEAD', 'PROPOSAL', 'NEGOTIATION', 'WON', 'ONHOLD']

const Pipeline = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { data: projects, isLoading } = useProjects()
  const updateProject = useUpdateProject()

  const [draggedId, setDraggedId] = useState(null)

  const getProjectsByStatus = (status) => {
    return projects?.filter((p) => p.status === status) || []
  }

  const getTotalAmount = (status) => {
    return getProjectsByStatus(status).reduce((sum, p) => sum + (p.amount || 0), 0)
  }

  const handleDragStart = (e, projectId) => {
    setDraggedId(projectId)
    e.dataTransfer.setData('text/plain', projectId)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    const projectId = parseInt(e.dataTransfer.getData('text/plain'))
    
    if (draggedId && projectId) {
      try {
        const project = projects?.find((p) => p.id === projectId)
        if (project && project.status !== newStatus) {
          await updateProject.mutateAsync({
            id: projectId,
            data: { ...project, status: newStatus },
          })
        }
      } catch (error) {
        console.error('Error updating project status:', error)
      }
    }
    setDraggedId(null)
  }

  if (isLoading) {
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 2, minWidth: 1200 }}>
          {columns.map((col) => (
            <Box key={col} sx={{ flex: 1, minWidth: 250 }}>
              <Skeleton variant="rounded" height={400} />
            </Box>
          ))}
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Pipeline
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
          minWidth: isMobile ? 1200 : 'auto',
        }}
      >
        {columns.map((statusKey) => {
          const status = statusConfig[statusKey]
          const columnProjects = getProjectsByStatus(statusKey)
          const totalAmount = getTotalAmount(statusKey)

          return (
            <Box
              key={statusKey}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, statusKey)}
              sx={{
                flex: 1,
                minWidth: 280,
                bgcolor: '#f8fafc',
                borderRadius: 3,
                p: 2,
                minHeight: 500,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  pb: 1,
                  borderBottom: `2px solid ${status.color}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: status.color,
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {status.label}
                  </Typography>
                  <Chip
                    label={columnProjects.length}
                    size="small"
                    sx={{ height: 20, fontSize: 11 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: status.color }}>
                  {formatCurrency(totalAmount)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {columnProjects.map((project) => (
                  <Card
                    key={project.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    sx={{
                      cursor: 'grab',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                      '&:active': {
                        cursor: 'grabbing',
                      },
                      opacity: draggedId === project.id ? 0.5 : 1,
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Avatar
                          src={project.customerLogoUrl}
                          sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: 12 }}
                        >
                          {project.customerName?.[0]}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {project.customerName}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'text.secondary',
                        }}
                      >
                        {project.projectName}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(project.amount, project.currency)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 4,
                              borderRadius: 2,
                              bgcolor: '#e2e8f0',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${project.probability || 0}%`,
                                height: '100%',
                                bgcolor:
                                  project.probability >= 70
                                    ? '#10b981'
                                    : project.probability >= 40
                                    ? '#f59e0b'
                                    : '#94a3b8',
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            %{project.probability || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                {columnProjects.length === 0 && (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      color: 'text.secondary',
                      border: `2px dashed ${status.border}`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption">
                      Proje yok
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default Pipeline

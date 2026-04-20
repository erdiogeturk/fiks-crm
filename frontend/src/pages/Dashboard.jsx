import { useNavigate } from 'react-router-dom'
import { Box, Typography, Skeleton, Card, CardContent, Grid } from '@mui/material'
import { useDashboard } from '../hooks/useDashboard'
import { statusConfig, primaryColor } from '../theme'

const formatCurrency = (amount, currency = 'TRY') => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

const formatDate = () => {
  return new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const KPICard = ({ title, value, subtitle, color, icon, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.2s',
      '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' } : {},
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${color}, ${color}88)`,
      }}
    />
    <CardContent sx={{ p: 3.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography
            sx={{
              fontSize: '12px',
              color: '#94a3b8',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#1e293b',
              lineHeight: 1,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: '12px', color: '#94a3b8', mt: 0.75 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ fontSize: '28px', opacity: 0.15 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
)

const StatusCard = ({ status, count, amount, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      flex: 1,
      minWidth: 130,
      p: 2.5,
      borderRadius: '12px',
      bgcolor: status.bg,
      border: `1px solid ${status.color}22`,
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    }}
  >
    <Typography
      sx={{ fontSize: '24px', fontWeight: 700, color: status.color }}
    >
      {count}
    </Typography>
    <Typography
      sx={{ fontSize: '13px', fontWeight: 600, color: status.color, mb: 0.5 }}
    >
      {status.label}
    </Typography>
    <Typography sx={{ fontSize: '12px', color: '#64748b' }}>
      {formatCurrency(amount)}
    </Typography>
  </Box>
)

const CustomerAvatar = ({ customer, size = 42 }) => {
  const initials = (customer || '??').slice(0, 2).toUpperCase()
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: size > 40 ? '12px' : '8px',
        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}88)`,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size > 40 ? 18 : 14,
        flexShrink: 0,
      }}
    >
      {initials}
    </Box>
  )
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { data: dashboard, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} sx={{ flex: 1, minWidth: 180 }}>
              <Skeleton variant="rounded" height={120} />
            </Box>
          ))}
        </Box>
        <Skeleton variant="rounded" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={200} />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#94a3b8' }}>
            {dashboard?.totalProjects || 0} proje · {formatDate()}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
        <KPICard
          title="Toplam Proje"
          value={dashboard?.totalProjects || 0}
          subtitle="Aktif portföy"
          color="#6366f1"
          icon="📊"
          onClick={() => navigate('/projects')}
        />
        <KPICard
          title="Kazanılan"
          value={formatCurrency(dashboard?.wonAmount)}
          subtitle={`${dashboard?.wonProjects || 0} proje`}
          color="#10b981"
          icon="🏆"
          onClick={() => navigate('/projects?status=WON')}
        />
        <KPICard
          title="Açık Pipeline"
          value={formatCurrency(dashboard?.pipelineAmount)}
          subtitle="Devam eden fırsatlar"
          color="#3b82f6"
          icon="🔄"
          onClick={() => navigate('/pipeline')}
        />
        <KPICard
          title="Müşteri Sayısı"
          value={dashboard?.totalCustomers || 0}
          subtitle="Kayıtlı hesaplar"
          color="#8b5cf6"
          icon="🏢"
          onClick={() => navigate('/customers')}
        />
        <KPICard
          title="Kazanma Oranı"
          value={`%${dashboard?.winRate || 0}`}
          subtitle="Won / (Won+Lost)"
          color="#f59e0b"
          icon="📈"
        />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: '#475569', mb: 2.5, fontSize: '15px' }}
          >
            Durum Dağılımı
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {Object.entries(statusConfig).map(([key, status]) => {
              const count = dashboard?.projectsByStatus?.[key] || 0
              const amount = dashboard?.amountByStatus?.[key] || 0
              return (
                <StatusCard
                  key={key}
                  status={status}
                  count={count}
                  amount={amount}
                  onClick={() => navigate(`/projects?status=${key}`)}
                />
              )
            })}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: '#475569', mb: 2.5, fontSize: '15px' }}
          >
            Yaklaşan Aksiyonlar
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {dashboard?.upcomingActions?.length > 0 ? (
              dashboard.upcomingActions.map((action) => (
                <Box
                  key={action.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: '10px',
                    bgcolor: '#f8fafc',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f1f5f9' },
                  }}
                  onClick={() => navigate(`/projects/${action.id}`)}
                >
                  <CustomerAvatar customer={action.customer} size={42} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                      {action.nextAction}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#94a3b8' }}>
                      {action.customer} · {action.projectName}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                    {action.nextActionDate}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ color: '#94a3b8', fontSize: '13px', py: 2 }}>
                Yaklaşan aksiyon yok
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Dashboard

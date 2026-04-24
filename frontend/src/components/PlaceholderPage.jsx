import { Box, Typography } from '@mui/material'
import ConstructionIcon from '@mui/icons-material/Construction'

const PlaceholderPage = ({ title }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 400,
      gap: 2,
    }}
  >
    <ConstructionIcon sx={{ fontSize: 52, color: 'divider' }} />
    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      Bu modül geliştirme aşamasındadır.
    </Typography>
  </Box>
)

export default PlaceholderPage

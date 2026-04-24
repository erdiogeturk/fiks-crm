import { useLocation, useNavigate } from 'react-router-dom'
import { Breadcrumbs, Typography, Box } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { menuConfig } from '../config/menuConfig'

const findBreadcrumbs = (items, pathname, ancestors = []) => {
  for (const item of items) {
    if (item.path) {
      if (pathname === item.path) {
        return [...ancestors, { label: item.label, path: item.path }]
      }
      // Match prefix for nested routes (e.g. /sistem/organizasyon/123)
      if (pathname.startsWith(item.path + '/')) {
        return [...ancestors, { label: item.label, path: item.path }]
      }
    }
    if (item.children) {
      const result = findBreadcrumbs(
        item.children,
        pathname,
        [...ancestors, { label: item.label, path: item.path || null }]
      )
      if (result) return result
    }
  }
  return null
}

const Breadcrumb = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const crumbs = findBreadcrumbs(menuConfig, location.pathname) || []

  if (crumbs.length <= 1) return null

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
        aria-label="breadcrumb"
      >
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          if (isLast || !crumb.path) {
            return (
              <Typography
                key={index}
                sx={{
                  fontSize: 13,
                  fontWeight: isLast ? 600 : 400,
                  color: isLast ? 'text.primary' : 'text.disabled',
                }}
              >
                {crumb.label}
              </Typography>
            )
          }
          return (
            <Typography
              key={index}
              component="span"
              onClick={() => navigate(crumb.path)}
              sx={{
                fontSize: 13,
                color: 'text.secondary',
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {crumb.label}
            </Typography>
          )
        })}
      </Breadcrumbs>
    </Box>
  )
}

export default Breadcrumb

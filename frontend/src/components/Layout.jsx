import { useState, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Collapse,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { logout, getUser } from '../services/authService'
import { useSchemaTables } from '../hooks/useSchema'
import { sidebarGradient, primaryColor } from '../theme'
import Breadcrumb from './Breadcrumb'
import { menuConfig } from '../config/menuConfig'

const DRAWER_WIDTH = 272

const FiksLogo = () => (
  <svg viewBox="0 0 117 40" xmlns="http://www.w3.org/2000/svg" style={{ height: 28, width: 'auto', display: 'block' }}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.531 26.6197L18.4465 22.6282L13.8324 19.9634L34.5775 7.9858V0L0 19.9634L11.531 26.6197ZM69.9591 7.75363C69.9591 9.61103 68.4534 11.1169 66.5958 11.1169C64.7383 11.1169 63.2324 9.61103 63.2324 7.75363C63.2324 5.89596 64.7383 4.39013 66.5958 4.39013C68.4534 4.39013 69.9591 5.89596 69.9591 7.75363ZM89.7 13.7437L81.1944 22.3506V4.81542H75.1859V36.1282H81.1944V29.1225L83.2424 27.2056L90.3352 36.1282H97.5704L87.2213 23.4773L97.6128 13.7437H89.7ZM115.763 27.2801C115.538 26.631 115.184 26.0534 114.706 25.5449C114.141 24.9521 113.38 24.4308 112.421 23.9789C111.49 23.528 110.348 23.1182 108.994 22.752C107.951 22.4703 107.118 22.2153 106.497 21.99C105.904 21.7646 105.454 21.5675 105.144 21.3972C105.027 21.3155 104.92 21.2266 104.823 21.1306C104.685 20.9942 104.566 20.8431 104.466 20.6773C104.325 20.3956 104.255 20.0984 104.255 19.7887C104.255 19.4787 104.311 19.1956 104.424 18.9423C104.565 18.6606 104.762 18.4337 105.017 18.2648C105.27 18.0956 105.582 17.969 105.948 17.8844C106.203 17.8296 106.477 17.7927 106.769 17.7734C106.927 17.763 107.091 17.7577 107.259 17.7577C107.796 17.7577 108.401 17.8703 109.079 18.0956C109.756 18.3211 110.404 18.6322 111.025 19.0268C111.675 19.421 112.252 19.8592 112.761 20.3377L115.976 16.7831C115.27 16.0772 114.438 15.4718 113.479 14.9634C112.548 14.4268 111.532 14.0182 110.432 13.7365C109.332 13.4548 108.204 13.314 107.048 13.314C105.892 13.314 104.792 13.4829 103.748 13.8223C102.704 14.1324 101.773 14.5844 100.955 15.1761C100.165 15.7689 99.5451 16.4872 99.093 17.3335C98.6422 18.152 98.4155 19.0689 98.4155 20.0845C98.4155 20.9308 98.5421 21.7069 98.7958 22.4111C99.0775 23.0887 99.4732 23.7225 99.9801 24.3153C100.573 24.9365 101.362 25.4999 102.349 26.0084C103.365 26.4872 104.592 26.911 106.031 27.2775C106.218 27.3283 106.397 27.3787 106.57 27.4284C106.825 27.5017 107.066 27.5737 107.291 27.6446C107.676 27.7661 108.017 27.8835 108.315 27.997C108.908 28.1944 109.345 28.3632 109.627 28.5041C110.134 28.8703 110.389 29.3648 110.389 29.9856C110.389 30.2958 110.318 30.5928 110.177 30.8745C110.065 31.1282 109.882 31.3534 109.627 31.5521C109.373 31.721 109.062 31.8618 108.696 31.9746C108.358 32.059 107.976 32.1014 107.554 32.1014C106.482 32.1014 105.41 31.9042 104.338 31.5083C103.266 31.0858 102.293 30.4082 101.418 29.4773L97.6944 32.6928C98.6817 33.9055 99.9789 34.8646 101.587 35.5703C103.224 36.2477 105.086 36.5859 107.173 36.5859C108.866 36.5859 110.389 36.2901 111.744 35.697C113.097 35.0759 114.155 34.2294 114.917 33.1577C115.707 32.0576 116.101 30.8168 116.101 29.4337C116.101 28.6435 115.989 27.9239 115.763 27.2761V27.2801ZM69.6 13.8985H63.5915V36.283H69.6V13.8985ZM55.0944 10.5056C54.7549 10.6745 54.5014 10.9435 54.3324 11.3097C54.162 11.6492 54.0775 12.0857 54.0775 12.6224V14.3153H58.9014V19.3928H54.0775V36.149H48.0268V19.3928H44.6845V14.3153H48.0268V12.1999C48.0268 10.8167 48.3365 9.56179 48.9577 8.43365C49.5789 7.30551 50.4253 6.4167 51.4972 5.76749C52.597 5.11828 53.8817 4.79424 55.3479 4.79424C56.3351 4.79424 57.2662 4.96479 58.1408 5.30259C59.0155 5.61262 59.762 6.04918 60.3831 6.61394L58.6056 11.014C58.4083 10.8918 58.2066 10.7823 58.0008 10.6852C57.8246 10.6022 57.6453 10.5282 57.4634 10.4633C57.0972 10.2943 56.7576 10.2096 56.4477 10.2096C55.9125 10.2096 55.4606 10.3084 55.0944 10.5056ZM34.5775 31.941V39.9241L13.8324 27.9465L34.5775 15.9692V23.9549L27.6606 27.9465L34.5775 31.941Z"
      fill="#ffffff"
    />
  </svg>
)

const hasActivePath = (item, pathname) => {
  if (item.path) {
    return pathname === item.path || pathname.startsWith(item.path + '/')
  }
  if (item.children) {
    return item.children.some(child => hasActivePath(child, pathname))
  }
  return false
}

const getInitialOpenGroups = (items, pathname) => {
  const open = new Set()
  const traverse = (items) => {
    for (const item of items) {
      if (item.children) {
        if (hasActivePath(item, pathname)) open.add(item.id)
        traverse(item.children)
      }
    }
  }
  traverse(items)
  return open
}

const MenuItem = ({ item, depth, openGroups, toggleGroup, onLeafClick }) => {
  const location = useLocation()
  const pathname = location.pathname
  const isLeaf = !item.children
  const isActive = isLeaf && (pathname === item.path || pathname.startsWith(item.path + '/'))
  const isOpen = openGroups.has(item.id)
  const pl = 16 + depth * 14

  if (isLeaf) {
    return (
      <Box
        onClick={() => onLeafClick(item.path)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pl: `${pl}px`,
          pr: 1.5,
          py: depth === 0 ? 1.1 : 0.8,
          mb: 0.25,
          borderRadius: '8px',
          cursor: 'pointer',
          position: 'relative',
          bgcolor: isActive ? 'rgba(255,255,255,0.13)' : 'transparent',
          color: isActive ? '#fff' : depth === 0 ? '#c7d2fe' : 'rgba(199,210,254,0.75)',
          fontWeight: isActive ? 600 : depth === 0 ? 500 : 400,
          fontSize: depth === 0 ? '13px' : '12px',
          transition: 'all 0.15s',
          '&:hover': {
            bgcolor: isActive ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.07)',
            color: '#fff',
          },
        }}
      >
        {depth > 0 && (
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              flexShrink: 0,
              bgcolor: isActive ? '#a5b4fc' : 'rgba(199,210,254,0.35)',
            }}
          />
        )}
        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {item.label}
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Box
        onClick={() => toggleGroup(item.id)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: `${pl}px`,
          pr: 1.5,
          py: depth === 0 ? 1.1 : 0.8,
          mb: 0.25,
          borderRadius: '8px',
          cursor: 'pointer',
          color: depth === 0 ? '#c7d2fe' : 'rgba(199,210,254,0.7)',
          fontWeight: depth === 0 ? 600 : 500,
          fontSize: depth === 0 ? '13px' : '12px',
          transition: 'all 0.15s',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.07)',
            color: '#fff',
          },
        }}
      >
        <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.label}
        </Box>
        <ChevronRightIcon
          sx={{
            fontSize: 16,
            color: 'rgba(199,210,254,0.45)',
            flexShrink: 0,
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(90deg)' : 'none',
          }}
        />
      </Box>
      <Collapse in={isOpen} timeout={180}>
        <Box>
          {item.children.map(child => (
            <MenuItem
              key={child.id}
              item={child}
              depth={depth + 1}
              openGroups={openGroups}
              toggleGroup={toggleGroup}
              onLeafClick={onLeafClick}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  )
}

const Layout = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = getUser()
  const { data: schemaTables = [] } = useSchemaTables()

  const computedMenu = useMemo(() => {
    return menuConfig.map(item => {
      if (item.id !== 'sistem') return item
      return {
        ...item,
        children: item.children.map(child => {
          if (child.id !== 'alan') return child
          return {
            ...child,
            children: schemaTables.filter(t => !t.maintenance).map(t => ({
              id: `alan-${t.tableName}`,
              path: `/sistem/alan/${t.tableName}`,
              label: t.displayName,
            })),
          }
        }),
      }
    })
  }, [schemaTables])

  const [openGroups, setOpenGroups] = useState(() =>
    getInitialOpenGroups(menuConfig, location.pathname)
  )

  const toggleGroup = (id) => {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleLeafClick = (path) => {
    navigate(path)
    if (isMobile) setMobileOpen(false)
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const drawer = (
    <Box sx={{ height: '100%', background: sidebarGradient, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <FiksLogo />
      </Box>
      <Typography
        sx={{
          color: 'rgba(165,180,252,0.6)',
          px: 2.5,
          mb: 2,
          fontSize: '10px',
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        CRM Sistemi
      </Typography>

      <Box
        sx={{
          flex: 1,
          px: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 2 },
        }}
      >
        {computedMenu.map(item => (
          <MenuItem
            key={item.id}
            item={item}
            depth={0}
            openGroups={openGroups}
            toggleGroup={toggleGroup}
            onLeafClick={handleLeafClick}
          />
        ))}
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ bgcolor: primaryColor, width: 32, height: 32, fontSize: 12, fontWeight: 700 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: 'white', fontSize: 13, fontWeight: 600, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              {user?.role?.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
        <Box
          onClick={handleLogout}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 1.5, py: 0.875, borderRadius: '8px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)', fontSize: 13,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' },
          }}
        >
          <LogoutIcon sx={{ fontSize: 17 }} />
          <Box>Çıkış Yap</Box>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: { md: 'none' },
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, color: 'text.primary' }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ color: 'text.primary', fontWeight: 600 }}>
            FiksCRM
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
          mt: { xs: 8, md: 0 },
        }}
      >
        <Breadcrumb />
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout

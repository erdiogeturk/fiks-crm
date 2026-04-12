import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#863bff',
      light: '#a366ff',
      dark: '#6b2bdd',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: '#f5f6fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { fontSize: '14px' },
    body2: { fontSize: '13px' },
    caption: { fontSize: '12px' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          letterSpacing: '0.3px',
          background: 'linear-gradient(135deg, #863bff, #6b2bdd)',
          '&:hover': {
            background: 'linear-gradient(135deg, #9a52ff, #7c38ee)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
          border: '1px solid #f0f0f0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e2e8f0',
            borderWidth: '1.5px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#863bff',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#863bff',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#f8fafc',
            fontWeight: 700,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#94a3b8',
            borderBottom: '2px solid #f0f0f0',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f8fafc',
          padding: '14px 16px',
        },
      },
    },
  },
})

export const statusConfig = {
  LEAD: { key: 'lead', label: 'Lead', color: '#6366f1', bg: '#eef2ff' },
  PROPOSAL: { key: 'proposal', label: 'Teklif', color: '#f59e0b', bg: '#fffbeb' },
  NEGOTIATION: { key: 'negotiation', label: 'Müzakere', color: '#3b82f6', bg: '#eff6ff' },
  WON: { key: 'won', label: 'Kazanıldı', color: '#10b981', bg: '#ecfdf5' },
  LOST: { key: 'lost', label: 'Kaybedildi', color: '#ef4444', bg: '#fef2f2' },
  ONHOLD: { key: 'onhold', label: 'Beklemede', color: '#8b5cf6', bg: '#f5f3ff' },
}

export const priorityConfig = {
  HIGH: { key: 'high', label: 'Yüksek', color: '#ef4444' },
  MEDIUM: { key: 'medium', label: 'Orta', color: '#f59e0b' },
  LOW: { key: 'low', label: 'Düşük', color: '#6b7280' },
}

export const sidebarGradient = 'linear-gradient(#111827 0%, #1a1f4e 100%)'

export const primaryColor = '#863bff'

export default theme

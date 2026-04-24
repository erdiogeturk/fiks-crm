import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { getAuthToken } from './services/authService'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Activities from './pages/Activities'
import Layout from './components/Layout'
import PlaceholderPage from './components/PlaceholderPage'
import UlkePage from './pages/bakimli/UlkePage'
import BolgePage from './pages/bakimli/BolgePage'
import IlPage from './pages/bakimli/IlPage'
import IlcePage from './pages/bakimli/IlcePage'
import PozisyonPage from './pages/bakimli/PozisyonPage'
import BirimPage from './pages/bakimli/BirimPage'
import ParaBirimiPage from './pages/bakimli/ParaBirimiPage'

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)

  useEffect(() => {
    const token = getAuthToken()
    setIsAuthenticated(!!token)
  }, [])

  if (isAuthenticated === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Ana modüller */}
        <Route path="musteriler" element={<Customers />} />
        <Route path="musteriler/:id" element={<CustomerDetail />} />
        <Route path="aktiviteler" element={<Activities />} />
        <Route path="satis-belgeleri" element={<PlaceholderPage title="Satış Belgeleri" />} />
        <Route path="urunler" element={<PlaceholderPage title="Ürünler" />} />

        {/* Sistem Yönetimi */}
        <Route path="sistem/organizasyon" element={<PlaceholderPage title="Organizasyon Yönetimi" />} />
        <Route path="sistem/roller" element={<PlaceholderPage title="Yetkilendirme/Rol Yönetimi" />} />
        <Route path="sistem/calisanlar" element={<PlaceholderPage title="Çalışan Yönetimi" />} />
        <Route path="sistem/kullanicilar" element={<PlaceholderPage title="Kullanıcı Yönetimi" />} />

        {/* Alan Yönetimi */}
        <Route path="sistem/alan/musteri" element={<PlaceholderPage title="Müşteri Alan Yönetimi" />} />
        <Route path="sistem/alan/ilgili-kisi" element={<PlaceholderPage title="İlgili Kişi Alan Yönetimi" />} />
        <Route path="sistem/alan/aktivite" element={<PlaceholderPage title="Aktivite Alan Yönetimi" />} />
        <Route path="sistem/alan/satis-belgesi" element={<PlaceholderPage title="Satış Belgesi Alan Yönetimi" />} />
        <Route path="sistem/alan/urun" element={<PlaceholderPage title="Ürün Alan Yönetimi" />} />

        {/* Bakımlı Tablo Yönetimi */}
        <Route path="sistem/bakimli/ulke"       element={<UlkePage />} />
        <Route path="sistem/bakimli/bolge"      element={<BolgePage />} />
        <Route path="sistem/bakimli/il"         element={<IlPage />} />
        <Route path="sistem/bakimli/ilce"       element={<IlcePage />} />
        <Route path="sistem/bakimli/pozisyon"   element={<PozisyonPage />} />
        <Route path="sistem/bakimli/birim"      element={<BirimPage />} />
        <Route path="sistem/bakimli/para-birimi" element={<ParaBirimiPage />} />
        <Route path="sistem/bakimli/urun-fiyat" element={<PlaceholderPage title="Ürün Fiyat Listesi" />} />

        {/* Diğer Sistem modülleri */}
        <Route path="sistem/onay" element={<PlaceholderPage title="Onay Süreçleri" />} />
        <Route path="sistem/kur" element={<PlaceholderPage title="Kur Dönüşümleri" />} />
        <Route path="sistem/liste" element={<PlaceholderPage title="Liste Sınırlamaları" />} />
        <Route path="sistem/veri/ice" element={<PlaceholderPage title="İçe Aktarım" />} />
        <Route path="sistem/veri/disa" element={<PlaceholderPage title="Dışa Aktarım" />} />
        <Route path="sistem/ciktilar/mail" element={<PlaceholderPage title="Mail Gönderimi" />} />
        <Route path="sistem/ciktilar/bildirim" element={<PlaceholderPage title="Bildirim Gönderimi" />} />
        <Route path="sistem/ciktilar/raporlar" element={<PlaceholderPage title="Raporlar" />} />

        {/* Eski route redirect'leri (geriye dönük uyumluluk) */}
        <Route path="customers" element={<Navigate to="/musteriler" replace />} />
        <Route path="customers/:id" element={<CustomerDetailRedirect />} />
        <Route path="activities" element={<Navigate to="/aktiviteler" replace />} />

        {/* Kaldırılan modüller — artık kullanılmıyor */}
        <Route path="projects" element={<Navigate to="/dashboard" replace />} />
        <Route path="projects/:id" element={<Navigate to="/dashboard" replace />} />
        <Route path="pipeline" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function CustomerDetailRedirect() {
  const { id } = useParams()
  return <Navigate to={`/musteriler/${id}`} replace />
}

export default App

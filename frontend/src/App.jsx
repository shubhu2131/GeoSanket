import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'

// Landing
import Landing from './pages/Landing'

// Admin
import Login from './pages/admin/Login'
import Layout from './components/Layout'
import Dashboard from './pages/admin/Dashboard'
import MapView from './pages/admin/MapView'
import Zones from './pages/admin/Zones'
import Projects from './pages/admin/Projects'
import Analytics from './pages/admin/Analytics'
import Users from './pages/admin/Users'

const PrivateRoute = ({ children }) => {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#0d0d1e', color: '#fff', border: '1px solid #1a1a2e' }
        }} />
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<Landing />} />

          {/* Admin */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={
            <PrivateRoute>
              <SocketProvider>
                <Layout />
              </SocketProvider>
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="map" element={<MapView />} />
            <Route path="zones" element={<Zones />} />
            <Route path="projects" element={<Projects />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<Users />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

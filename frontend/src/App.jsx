import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ThemeProvider } from './context/ThemeContext'

import Landing from './pages/Landing'
import CitizenLogin from './pages/CitizenLogin'
import CitizenDashboard from './pages/CitizenDashboard'
import Login from './pages/admin/Login'
import Layout from './components/Layout'
import Dashboard from './pages/admin/Dashboard'
import MapView from './pages/admin/MapView'
import Zones from './pages/admin/Zones'
import Projects from './pages/admin/Projects'
import Analytics from './pages/admin/Analytics'
import Users from './pages/admin/Users'

const AdminRoute = ({ children }) => {
  const { isAuth, user } = useAuth()
  if (!isAuth) return <Navigate to="/admin/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/citizen" replace />
  return children
}

const CitizenRoute = ({ children }) => {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#0d0d1e', color: '#fff', border: '1px solid #1a1a2e', fontSize: 13, fontFamily: "'DM Sans', sans-serif" },
              success: { iconTheme: { primary: '#22c55e', secondary: '#0d0d1e' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#0d0d1e' } },
              duration: 4000,
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<CitizenLogin />} />
            <Route path="/citizen" element={<CitizenRoute><CitizenDashboard /></CitizenRoute>} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={
              <AdminRoute>
                <SocketProvider><Layout /></SocketProvider>
              </AdminRoute>
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
    </ThemeProvider>
  )
}

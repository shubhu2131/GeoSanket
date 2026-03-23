import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/map', icon: '🗺️', label: 'Live Map' },
  { path: '/admin/zones', icon: '📍', label: 'Zones' },
  { path: '/admin/projects', icon: '🏛️', label: 'Projects' },
  { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
  { path: '/admin/users', icon: '👥', label: 'Users' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { connected } = useSocket()
  const { t } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/admin/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', background: t.bg, overflow: 'hidden', fontFamily: t.font }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: t.surface, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'background .3s' }}>
        <div style={{ padding: '22px 20px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5, color: t.text }}>
            Geo<span style={{ color: t.purple }}>Sanket</span>
          </div>
          <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>Admin Panel</div>
        </div>

        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 8, marginBottom: 4, textDecoration: 'none', fontSize: 13,
              fontWeight: isActive ? 600 : 400, transition: 'all .15s',
              background: isActive ? (t.isDark ? 'rgba(124,58,237,.15)' : '#f5f3ff') : 'transparent',
              color: isActive ? t.purple : t.muted,
              border: isActive ? `1px solid ${t.isDark ? 'rgba(124,58,237,.3)' : '#ddd6fe'}` : '1px solid transparent',
              fontFamily: t.font
            })}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '14px 12px', borderTop: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 11, color: t.muted }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444', boxShadow: connected ? '0 0 6px #22c55e' : 'none', display: 'inline-block' }}></span>
            {connected ? 'Live feed connected' : 'Offline'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: t.muted }}>Admin</div>
            </div>
            <ThemeToggle style={{ color: t.muted, borderColor: t.border, padding: '4px 8px', fontSize: 14 }} />
          </div>
          <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: `1px solid ${t.border}`, color: t.muted, padding: '8px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: t.font }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 28, background: t.bg, transition: 'background .3s' }}>
        <Outlet />
      </main>
    </div>
  )
}

import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

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
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/admin/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#05050f', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#0d0d1e', borderRight: '1px solid #1a1a2e', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1a1a2e' }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18 }}>
            Geo<span style={{ color: '#a855f7' }}>Sanket</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Admin Panel</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
              marginBottom: 4, textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'all .2s',
              background: isActive ? 'rgba(124,58,237,.15)' : 'transparent',
              color: isActive ? '#a855f7' : '#94a3b8',
              border: isActive ? '1px solid rgba(124,58,237,.3)' : '1px solid transparent'
            })}>
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1a1a2e' }}>
          {/* Socket status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 11, color: '#64748b' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444', boxShadow: connected ? '0 0 6px #22c55e' : 'none', display: 'inline-block' }}></span>
            {connected ? 'Live connected' : 'Offline'}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, color: '#94a3b8' }}>{user?.name}</div>
            <div style={{ fontSize: 11 }}>Admin</div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: '1px solid #1a1a2e', color: '#64748b', padding: '8px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        <Outlet />
      </main>
    </div>
  )
}

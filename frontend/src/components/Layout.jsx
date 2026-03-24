import { useState } from 'react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/admin/login') }

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5, color: t.text }}>
            Geo<span style={{ color: t.purple }}>Sanket</span>
          </div>
          <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>Admin Panel</div>
        </div>
        <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: t.muted, fontSize: 18, cursor: 'pointer', padding: 4, lineHeight: 1, display: window.innerWidth <= 768 ? 'block' : 'none' }}>✕</button>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 8, marginBottom: 4, textDecoration: 'none', fontSize: 13,
            fontWeight: isActive ? 600 : 400, transition: 'all .15s', fontFamily: t.font,
            background: isActive ? (t.isDark ? 'rgba(124,58,237,.15)' : '#f5f3ff') : 'transparent',
            color: isActive ? t.purple : t.muted,
            border: isActive ? `1px solid ${t.isDark ? 'rgba(124,58,237,.3)' : '#ddd6fe'}` : '1px solid transparent',
          })}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px', borderTop: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11, color: t.muted }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444', display: 'inline-block' }}></span>
          {connected ? 'Live connected' : 'Offline'}
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
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', background: t.bg, overflow: 'hidden', fontFamily: t.font }}>
      <style>{`
        .gs-sidebar-desktop { display: flex; flex-direction: column; }
        .gs-topbar { display: none; }
        .gs-sidebar-mobile { display: none; }
        .gs-overlay { display: none; }
        @media (max-width: 768px) {
          .gs-sidebar-desktop { display: none !important; }
          .gs-topbar { display: flex !important; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside className="gs-sidebar-desktop" style={{ width: 220, background: t.surface, borderRight: `1px solid ${t.border}`, flexShrink: 0, transition: 'background .3s' }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, display: 'block' }} />
      )}

      {/* Mobile sidebar drawer */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', width: 240,
        background: t.surface, borderRight: `1px solid ${t.border}`,
        zIndex: 201, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .25s ease', display: 'flex', flexDirection: 'column'
      }}>
        <SidebarContent />
      </aside>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Mobile topbar */}
        <div className="gs-topbar" style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 6, padding: '7px 11px', cursor: 'pointer', color: t.text, fontSize: 15, lineHeight: 1 }}>
              ☰
            </button>
            <div style={{ fontWeight: 800, fontSize: 16, color: t.text }}>
              Geo<span style={{ color: t.purple }}>Sanket</span>
            </div>
          </div>
          <ThemeToggle style={{ color: t.muted, borderColor: t.border, padding: '4px 8px', fontSize: 14 }} />
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: 24, background: t.bg, transition: 'background .3s' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

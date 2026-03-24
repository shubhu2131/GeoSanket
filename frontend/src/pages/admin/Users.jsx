import { useEffect, useState } from 'react'
import { getUsers } from '../../api'
import { useTheme } from '../../context/ThemeContext'

export default function Users() {
  const [users, setUsers] = useState([])
  const { t } = useTheme()

  useEffect(() => {
    getUsers().then(r => setUsers(r.data.users)).catch(console.error)
  }, [])

  return (
    <div style={{ fontFamily: t.font }}>
      <h1 style={{ fontWeight: 800, fontSize: 22, marginBottom: 4, color: t.text, letterSpacing: -0.5 }}>Users</h1>
      <p style={{ color: t.muted, fontSize: 13, marginBottom: 20 }}>{users.length} registered users</p>

      {/* Mobile: cards, Desktop: table */}
      <style>{`
        .users-table-wrap { display: block; }
        .users-cards { display: none; }
        @media (max-width: 640px) {
          .users-table-wrap { display: none; }
          .users-cards { display: flex; flex-direction: column; gap: 10px; }
        }
      `}</style>

      {/* Desktop table */}
      <div className="users-table-wrap" style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                {['Name', 'Phone / Device', 'Role', 'Language', 'Notifications', 'FCM'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, color: t.muted, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: `1px solid ${t.border}` }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, color: t.text }}>{u.name || 'Anonymous'}</td>
                  <td style={{ padding: '12px 16px', color: t.muted, fontSize: 12 }}>{u.phone || (u.deviceId ? u.deviceId.slice(0, 14) + '…' : '—')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: u.role === 'admin' ? 'rgba(239,68,68,.1)' : 'rgba(59,130,246,.1)', color: u.role === 'admin' ? '#ef4444' : '#3b82f6', border: `1px solid ${u.role === 'admin' ? 'rgba(239,68,68,.2)' : 'rgba(59,130,246,.2)'}`, fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: t.muted, fontSize: 12 }}>{u.language || 'hi'}</td>
                  <td style={{ padding: '12px 16px', color: '#22c55e', fontWeight: 700, fontSize: 14 }}>{u.totalNotificationsReceived || 0}</td>
                  <td style={{ padding: '12px 16px', color: u.fcmToken ? '#22c55e' : t.muted, fontSize: 12 }}>{u.fcmToken ? '✓' : '—'}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: t.muted, fontSize: 13 }}>No users yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="users-cards">
        {users.map(u => (
          <div key={u._id} style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: t.text }}>{u.name || 'Anonymous'}</div>
              <span style={{ background: u.role === 'admin' ? 'rgba(239,68,68,.1)' : 'rgba(59,130,246,.1)', color: u.role === 'admin' ? '#ef4444' : '#3b82f6', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase' }}>{u.role}</span>
            </div>
            <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.8 }}>
              📱 {u.phone || (u.deviceId ? u.deviceId.slice(0, 16) + '…' : '—')}<br />
              🌐 {u.language || 'hi'} &nbsp;·&nbsp; 🔔 {u.totalNotificationsReceived || 0} notifications<br />
              FCM: {u.fcmToken ? '✅ Set' : '— Not set'}
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: t.muted, fontSize: 13, background: t.cardBg, borderRadius: 12, border: `1px solid ${t.border}` }}>No users yet</div>
        )}
      </div>
    </div>
  )
}

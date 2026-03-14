import { useEffect, useState } from 'react'
import { getUsers } from '../../api'

export default function Users() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    getUsers().then(r => setUsers(r.data.users)).catch(() => {})
  }, [])

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Users</h1>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>{users.length} registered users</p>
      <div style={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #1a1a2e' }}>
            {['Name', 'Phone / Device', 'Role', 'Language', 'Notifications', 'FCM'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: 14 }}>{u.name || 'Anonymous'}</td>
                <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: 13 }}>{u.phone || (u.deviceId ? u.deviceId.slice(0,16) + '…' : '—')}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ background: u.role === 'admin' ? 'rgba(239,68,68,.1)' : 'rgba(59,130,246,.1)', color: u.role === 'admin' ? '#ef4444' : '#3b82f6', border: `1px solid ${u.role === 'admin' ? 'rgba(239,68,68,.2)' : 'rgba(59,130,246,.2)'}`, fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase' }}>{u.role}</span>
                </td>
                <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: 13 }}>{u.language || 'hi'}</td>
                <td style={{ padding: '14px 20px', color: '#22c55e', fontWeight: 700 }}>{u.totalNotificationsReceived || 0}</td>
                <td style={{ padding: '14px 20px', color: u.fcmToken ? '#22c55e' : '#475569', fontSize: 12 }}>{u.fcmToken ? '✓ Set' : '— None'}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>No users yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

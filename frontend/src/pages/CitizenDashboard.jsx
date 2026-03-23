import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function CitizenDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [zones, setZones] = useState([])
  const [notifications, setNotifications] = useState([])
  const [simulating, setSimulating] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    API.get('/api/zones').then(r => setZones(r.data.zones)).catch(console.error)
    API.get('/api/notifications').then(r => setNotifications(r.data.notifications)).catch(console.error)
  }, [user])

  const simulateEntry = async (zone) => {
    setSimulating(true)
    try {
      const [lng, lat] = zone.centerPoint.coordinates
      const { data } = await API.post('/api/location/ping', {
        lat, lng, zoneId: zone._id, enteredZone: true
      })
      const result = data.notifications?.[0]
      if (result?.status === 'notified') toast.success(`✅ Notification fired for ${zone.name}!`)
      else if (result?.status === 'deduped') toast(`⏳ Already notified for ${zone.name} — wait 24hrs`, { icon: 'ℹ️' })
      else if (result?.status?.includes('dwell')) toast(`⏱ Dwell timer started for ${zone.name}`, { icon: '⏱' })
      else toast(`Response: ${result?.status || 'unknown'}`)
      API.get('/api/notifications').then(r => setNotifications(r.data.notifications)).catch(console.error)
    } catch (err) {
      toast.error(`Simulation failed: ${err.response?.data?.error || err.message}`)
      console.error('[SimulateEntry]', err)
    } finally { setSimulating(false) }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ minHeight: '100vh', background: '#05050f', padding: 24 }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, maxWidth: 900, margin: '0 auto 32px' }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22 }}>
          Geo<span style={{ color: '#22c55e' }}>Sanket</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>👤 {user?.name}</span>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #1a1a2e', color: '#64748b', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>Welcome, {user?.name} 👋</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32 }}>Simulate entering a geo-fenced zone to test push notifications</p>

        {/* How it works */}
        <div style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 28, fontSize: 13, color: '#22c55e', lineHeight: 1.7 }}>
          <strong>How to test:</strong> Click "Simulate Entry" on any zone below → the backend runs the full pipeline (dedup check → dwell check → FCM notification). If your FCM token is set you'll get a real push notification!
        </div>

        {/* Active Zones */}
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Active Zones ({zones.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16, marginBottom: 40 }}>
          {zones.map(zone => {
            const typeColors = { hospital: '#ef4444', college: '#3b82f6', bridge: '#f97316', road: '#22c55e', park: '#a855f7', other: '#64748b' }
            const color = typeColors[zone.zoneType] || '#64748b'
            return (
              <div key={zone._id} style={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 12, padding: 20, borderLeft: `3px solid ${color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{zone.name}</div>
                    <span style={{ background: `${color}18`, color, border: `1px solid ${color}33`, fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase' }}>{zone.zoneType}</span>
                  </div>
                </div>
                {zone.project && (
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>
                    🏛️ {zone.project.name?.en}<br/>
                    💰 ₹{((zone.project.budget?.sanctioned || 0) / 1e7).toFixed(0)} Cr · {zone.project.completionPercentage}% done
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
                  Radius: {zone.radiusMeters}m · Dwell: {zone.dwellTimeSeconds}s
                </div>
                <button
                  onClick={() => simulateEntry(zone)}
                  disabled={simulating}
                  style={{ width: '100%', background: simulating ? '#1a1a2e' : `${color}18`, color, border: `1px solid ${color}33`, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: simulating ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans,sans-serif' }}
                >
                  {simulating ? 'Simulating...' : '📍 Simulate Entry'}
                </button>
              </div>
            )
          })}
          {zones.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: 13 }}>
              No active zones — admin needs to create them first
            </div>
          )}
        </div>

        {/* Notification History */}
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Your Notification History ({notifications.length})</h2>
        <div style={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 12, overflow: 'hidden' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>No notifications yet — simulate a zone entry above</div>
          ) : notifications.map(n => (
            <div key={n._id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{n.zone?.name || 'Unknown zone'}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{n.project?.name?.en || '—'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: n.status === 'sent' ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', color: n.status === 'sent' ? '#22c55e' : '#ef4444', border: `1px solid ${n.status === 'sent' ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`, fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{n.status}</span>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString('en-IN')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function CitizenDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [zones, setZones] = useState([])
  const [notifications, setNotifications] = useState([])
  const [simulating, setSimulating] = useState(null)
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )

  const fetchData = useCallback(async () => {
    try {
      const [zr, nr] = await Promise.all([API.get('/api/zones'), API.get('/api/notifications')])
      setZones(zr.data.zones)
      setNotifications(nr.data.notifications)
    } catch (err) { console.error('[CitizenDashboard]', err) }
  }, [])

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchData()
  }, [user, fetchData])

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') { toast.error('Not supported in this browser'); return }
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
    if (perm === 'granted') toast.success('Notifications enabled!')
    else toast.error('Permission denied — enable in browser settings')
  }

  const showBrowserNotif = (zone) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const p = zone.project
    const title = p?.notificationTitle?.en || p?.name?.en || zone.name
    const body = p?.notificationBody?.en ||
      `₹${((p?.budget?.sanctioned || 0) / 1e7).toFixed(0)}Cr · ${p?.completionPercentage || 0}% complete · ${p?.leader?.name || ''}`
    const n = new Notification(title, { body, tag: zone._id })
    n.onclick = () => { window.focus(); n.close() }
  }

  const simulateEntry = async (zone) => {
    setSimulating(zone._id)
    try {
      const [lng, lat] = zone.centerPoint.coordinates
      const { data } = await API.post('/api/location/ping', {
        lat, lng, zoneId: zone._id, enteredZone: true
      })
      const result = data.notifications?.[0]

      if (result?.status === 'notified') {
        toast.success(`Notification fired for ${zone.name}!`)
        showBrowserNotif(zone)  // always show browser notif
      } else if (result?.status === 'deduped') {
        toast(`Already notified today — showing demo notification anyway`, { icon: 'ℹ️' })
        showBrowserNotif(zone)  // show demo anyway
      } else if (result?.status?.includes('dwell')) {
        toast(`Dwell timer started — in real app wait 5 min inside zone`, { icon: '⏱' })
      } else {
        // Fallback — show browser notif anyway for demo
        toast.success(`Zone entry simulated — showing demo notification`)
        showBrowserNotif(zone)
      }
      await fetchData()
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.error || err.message}`)
      console.error('[SimulateEntry]', err)
    } finally { setSimulating(null) }
  }

  const typeColors = { hospital: '#ef4444', college: '#3b82f6', bridge: '#f97316', road: '#22c55e', park: '#a855f7', other: '#6b7280' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'system-ui,-apple-system,Segoe UI,sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#111' }}>
          Geo<span style={{ color: '#16a34a' }}>Sanket</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#16a34a', marginLeft: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 20 }}>Citizen</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>👤 {user?.name}</span>
          <button onClick={() => { logout(); navigate('/login') }} style={{ background: 'transparent', border: '1px solid #d1d5db', color: '#374151', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111', marginBottom: 6, letterSpacing: -0.5 }}>Welcome, {user?.name} 👋</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Simulate entering a geo-fenced government zone and see the full notification pipeline run.</p>

        {/* Permission banner */}
        {notifPermission !== 'granted' && (
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#92400e', fontSize: 14, marginBottom: 3 }}>⚠️ Enable notifications for the full demo</div>
              <div style={{ fontSize: 13, color: '#78350f' }}>You'll see a real browser notification pop up when you simulate a zone entry.</div>
            </div>
            <button onClick={requestPermission} style={{ background: '#f59e0b', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Enable Now</button>
          </div>
        )}

        {notifPermission === 'granted' && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#166534' }}>
            ✅ Notifications are enabled — you'll see a real pop-up when you simulate zone entry.
          </div>
        )}

        {/* Steps */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 14 }}>How to test this</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Enable browser notifications above',
              'Click "Simulate Zone Entry" on any zone below',
              'Backend checks dedup + dwell → fires notification logic',
              'Real browser notification appears on your screen',
              'Notification logged in your history below'
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: '#374151', paddingTop: 3, lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zones */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Active Zones ({zones.length})</h2>
          <button onClick={fetchData} style={{ background: '#fff', border: '1px solid #d1d5db', color: '#374151', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>↻ Refresh</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, marginBottom: 40 }}>
          {zones.map(zone => {
            const color = typeColors[zone.zoneType] || '#6b7280'
            const isSim = simulating === zone._id
            return (
              <div key={zone._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, borderTop: `3px solid ${color}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.3, flex: 1, marginRight: 8 }}>{zone.name}</div>
                  <span style={{ background: `${color}15`, color, fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase', flexShrink: 0 }}>{zone.zoneType}</span>
                </div>
                {zone.project && (
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, lineHeight: 1.7, color: '#374151' }}>
                    <strong>{zone.project.name?.en}</strong><br />
                    💰 ₹{((zone.project.budget?.sanctioned || 0) / 1e7).toFixed(0)} Cr &nbsp;·&nbsp; ✅ {zone.project.completionPercentage}% done<br />
                    👤 {zone.project.leader?.name || 'N/A'}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>Radius: {zone.radiusMeters}m · Dwell: {zone.dwellTimeSeconds}s</div>
                <button onClick={() => simulateEntry(zone)} disabled={!!simulating} style={{ marginTop: 'auto', width: '100%', background: isSim ? '#f3f4f6' : color, color: isSim ? '#6b7280' : '#fff', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: simulating ? 'not-allowed' : 'pointer', transition: 'all .2s' }}>
                  {isSim ? '⏳ Simulating...' : '📍 Simulate Zone Entry'}
                </button>
              </div>
            )
          })}
          {zones.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 14 }}>
              No active zones — admin needs to create zones first
            </div>
          )}
        </div>

        {/* History */}
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 16 }}>Notification History ({notifications.length})</h2>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No notifications yet</div>
          ) : notifications.map((n, i) => (
            <div key={n._id} style={{ padding: '14px 20px', borderBottom: i < notifications.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 2 }}>{n.zone?.name || 'Unknown zone'}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{n.project?.name?.en || '—'}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ background: n.status === 'sent' ? '#f0fdf4' : '#fef2f2', color: n.status === 'sent' ? '#16a34a' : '#dc2626', border: `1px solid ${n.status === 'sent' ? '#bbf7d0' : '#fecaca'}`, fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600, display: 'block', marginBottom: 4 }}>{n.status}</span>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
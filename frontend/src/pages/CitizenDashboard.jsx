import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import API from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

// ─── Fix default Leaflet marker icons ────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ─── Pulsing user-location icon ───────────────────────────────────────────────
const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:20px;height:20px">
      <div style="position:absolute;inset:0;background:#3b82f6;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 0 2px #3b82f6;z-index:2"></div>
      <div style="position:absolute;inset:-6px;background:#3b82f640;border-radius:50%;animation:gps-pulse 1.6s ease-out infinite"></div>
    </div>
    <style>@keyframes gps-pulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.4);opacity:0}}</style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

// ─── Fly map to user on first GPS fix ────────────────────────────────────────
function MapController({ center }) {
  const map = useMap()
  const didFly = useRef(false)
  useEffect(() => {
    if (center && !didFly.current) {
      map.flyTo(center, 16, { duration: 1.5 })
      didFly.current = true
    }
  }, [center, map])
  return null
}

// ─── Haversine distance ───────────────────────────────────────────────────────
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const typeColors = {
  hospital: '#ef4444',
  college:  '#3b82f6',
  bridge:   '#f97316',
  road:     '#22c55e',
  park:     '#a855f7',
  other:    '#6b7280',
}

// ─── Notification helper — SW first (mobile), fallback to new Notification() ─
let swReg = null

async function registerSW() {
  if (!('serviceWorker' in navigator)) return
  try {
    swReg = await navigator.serviceWorker.register('/sw.js')
    console.log('[SW] Registered')
  } catch (e) {
    console.warn('[SW] Registration failed:', e)
  }
}

async function showPushNotification(title, body, tag) {
  // Try Service Worker (required on Android Chrome)
  const reg = swReg || (await navigator.serviceWorker?.getRegistration?.())
  if (reg && Notification.permission === 'granted') {
    try {
      await reg.showNotification(title, { body, tag: String(tag), icon: '/favicon.ico', requireInteraction: false })
      return
    } catch (e) {
      console.warn('[SW notify] failed, trying fallback:', e)
    }
  }
  // Fallback: new Notification() — works on desktop
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, { body, tag: String(tag) })
      n.onclick = () => { window.focus(); n.close() }
      return
    } catch (e) {
      console.warn('[Notification] failed:', e)
    }
  }
  // Final fallback: big toast
  toast.success(`🔔 ${title} — ${body}`, { duration: 8000 })
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CitizenDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [zones,           setZones]           = useState([])
  const [notifications,   setNotifications]   = useState([])
  const [simulating,      setSimulating]      = useState(null)
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )
  const [gpsPos,      setGpsPos]      = useState(null)
  const [gpsStatus,   setGpsStatus]   = useState('idle')
  const [gpsError,    setGpsError]    = useState(null)
  const [nearbyZones, setNearbyZones] = useState([])
  const [insideZones, setInsideZones] = useState([])

  // ── Refs — avoid ALL stale closures ──────────────────────────────────────
  const zonesRef    = useRef([])   // always latest zones
  const gpsPosRef   = useRef(null) // always latest gps position
  const watchIdRef  = useRef(null)
  const lastPingRef = useRef(0)
  const PING_MS     = 8000         // 8s ping interval

  useEffect(() => { zonesRef.current = zones    }, [zones])
  useEffect(() => { gpsPosRef.current = gpsPos  }, [gpsPos])

  // ── Register SW on mount ──────────────────────────────────────────────────
  useEffect(() => { registerSW() }, [])

  // ── Fetch zones + history ─────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [zr, nr] = await Promise.all([
        API.get('/api/zones'),
        API.get('/api/notifications'),
      ])
      setZones(zr.data.zones)
      setNotifications(nr.data.notifications)
    } catch (err) {
      console.error('[CitizenDashboard]', err)
    }
  }, [])

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchData()
  }, [user, fetchData])

  // ── Ping backend — NO zone/gpsPos in deps, uses refs instead ─────────────
  const pingBackend = useCallback(async (lat, lng) => {
    const now = Date.now()
    if (now - lastPingRef.current < PING_MS) return
    lastPingRef.current = now

    console.log('[Ping]', lat.toFixed(5), lng.toFixed(5))

    try {
      const { data } = await API.post('/api/location/ping', { lat, lng })
      console.log('[Ping result]', JSON.stringify(data.notifications))

      if (!data.notifications?.length) return

      const currentZones = zonesRef.current  // fresh reference, not stale closure

      for (const result of data.notifications) {
        if (result.status === 'notified') {
          // Find zone from ref
          const zone = currentZones.find(z => String(z._id) === String(result.zoneId))
          const p    = zone?.project || result.project

          const title = p?.notificationTitle?.en || p?.name?.en || zone?.name || 'GeoSanket Alert'
          const body  = p?.notificationBody?.en  ||
            `₹${((p?.budget?.sanctioned || 0) / 1e7).toFixed(0)}Cr · ${p?.completionPercentage || 0}% complete · ${p?.leader?.name || ''}`

          toast.success(`📍 ${zone?.name || 'Zone'} — notification fired!`, { duration: 5000 })
          showPushNotification(title, body, result.zoneId)
          fetchData() // refresh history

        } else if (result.status === 'dwell_started') {
          const zone = currentZones.find(z => String(z._id) === String(result.zoneId))
          toast(`⏱ Entered ${zone?.name || 'zone'} — dwell timer started`, { icon: '📍', duration: 3000 })

        } else if (result.status?.startsWith('dwelling_')) {
          console.log(`[Dwell in progress] ${result.status}`)
        }
      }
    } catch (err) {
      console.error('[pingBackend error]', err)
    }
  }, [fetchData]) // NO zones — uses zonesRef

  // ── Update proximity — NO zones in deps, uses zonesRef ───────────────────
  const updateProximity = useCallback((lat, lng) => {
    const z = zonesRef.current
    if (!z.length) return
    const withDist = z.map(zone => {
      const [zLng, zLat] = zone.centerPoint.coordinates
      return { ...zone, distanceMeters: Math.round(getDistanceMeters(lat, lng, zLat, zLng)) }
    }).sort((a, b) => a.distanceMeters - b.distanceMeters)
    setNearbyZones(withDist.slice(0, 3))
    setInsideZones(withDist.filter(z => z.distanceMeters <= z.radiusMeters))
  }, []) // stable — no deps

  // ── GPS callbacks — stable references ────────────────────────────────────
  const onGpsSuccess = useCallback((pos) => {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords
    setGpsPos({ lat, lng, accuracy })
    setGpsStatus('active')
    setGpsError(null)
    updateProximity(lat, lng)
    pingBackend(lat, lng)
  }, [updateProximity, pingBackend])

  const onGpsError = useCallback((err) => {
    setGpsStatus('error')
    setGpsError(err.message)
    console.error('[GPS]', err)
  }, [])

  const startGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error'); setGpsError('Geolocation not supported'); return
    }
    setGpsStatus('requesting')
    watchIdRef.current = navigator.geolocation.watchPosition(
      onGpsSuccess, onGpsError,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    )
  }, [onGpsSuccess, onGpsError])

  const stopGPS = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setGpsStatus('idle'); setGpsPos(null)
    setNearbyZones([]); setInsideZones([])
    lastPingRef.current = 0
  }, [])

  // Re-run proximity when zones load while GPS is already active
  useEffect(() => {
    if (gpsPosRef.current && zones.length) {
      updateProximity(gpsPosRef.current.lat, gpsPosRef.current.lng)
    }
  }, [zones, updateProximity])

  // Cleanup watcher on unmount
  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  // ── Request notification permission ───────────────────────────────────────
  const requestPermission = async () => {
    if (typeof Notification === 'undefined') { toast.error('Notifications not supported'); return }
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
    if (perm === 'granted') { toast.success('Notifications enabled!'); await registerSW() }
    else toast.error('Permission denied — enable in browser settings')
  }

  // ── Simulate zone entry ───────────────────────────────────────────────────
  const simulateEntry = async (zone) => {
    setSimulating(zone._id)
    try {
      const [lng, lat] = zone.centerPoint.coordinates
      const { data } = await API.post('/api/location/ping', { lat, lng, zoneId: zone._id, enteredZone: true })
      const result = data.notifications?.[0]
      const p = zone.project
      const title = p?.notificationTitle?.en || p?.name?.en || zone.name
      const body  = p?.notificationBody?.en  || `₹${((p?.budget?.sanctioned||0)/1e7).toFixed(0)}Cr · ${p?.completionPercentage||0}% complete`

      if (result?.status === 'notified') {
        toast.success(`Notification fired for ${zone.name}!`)
        showPushNotification(title, body, zone._id)
      } else if (result?.status === 'deduped') {
        toast(`Already notified today — showing demo anyway`, { icon: 'ℹ️' })
        showPushNotification(title, body, zone._id)
      } else if (result?.status?.includes('dwell')) {
        toast(`Dwell timer started`, { icon: '⏱' })
      } else {
        toast.success(`Zone entry simulated`)
        showPushNotification(title, body, zone._id)
      }
      await fetchData()
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.error || err.message}`)
    } finally { setSimulating(null) }
  }

  const mapCenter = gpsPos
    ? [gpsPos.lat, gpsPos.lng]
    : zones.length ? [zones[0].centerPoint.coordinates[1], zones[0].centerPoint.coordinates[0]]
    : [28.6139, 77.2090]

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'system-ui,-apple-system,Segoe UI,sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#111' }}>
          Geo<span style={{ color: '#16a34a' }}>Sanket</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#16a34a', marginLeft: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 20 }}>Citizen</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {gpsStatus === 'active'     && <span style={{ fontSize: 12, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>📡 GPS · {gpsPos?.lat.toFixed(4)}, {gpsPos?.lng.toFixed(4)}</span>}
          {gpsStatus === 'requesting' && <span style={{ fontSize: 12, color: '#d97706', background: '#fffbeb', border: '1px solid #fcd34d', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>⏳ Getting GPS...</span>}
          {gpsStatus === 'error'      && <span style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>⚠️ GPS Error</span>}
          <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>👤 {user?.name}</span>
          <button onClick={() => { logout(); navigate('/login') }} style={{ background: 'transparent', border: '1px solid #d1d5db', color: '#374151', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111', marginBottom: 6, letterSpacing: -0.5 }}>Welcome, {user?.name} 👋</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Activate real GPS to auto-receive notifications when you physically enter a government zone — or simulate it below.
        </p>

        {/* Notification permission */}
        {notifPermission !== 'granted' ? (
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#92400e', fontSize: 14, marginBottom: 3 }}>⚠️ Enable notifications for the full demo</div>
              <div style={{ fontSize: 13, color: '#78350f' }}>You'll see a real browser push notification when you enter a zone.</div>
            </div>
            <button onClick={requestPermission} style={{ background: '#f59e0b', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Enable Now</button>
          </div>
        ) : (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#166534' }}>
            ✅ Notifications are enabled — you'll see a real pop-up when you enter a zone.
          </div>
        )}

        {/* GPS Control */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 6 }}>📡 Real GPS Tracking</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, maxWidth: 480 }}>
                Your real location is checked every 8 seconds. Walk into a zone and the notification fires automatically — no button needed.
              </div>
            </div>
            <div>
              {gpsStatus !== 'active' ? (
                <button onClick={startGPS} disabled={gpsStatus === 'requesting'}
                  style={{ background: gpsStatus === 'requesting' ? '#f3f4f6' : '#16a34a', color: gpsStatus === 'requesting' ? '#6b7280' : '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: gpsStatus === 'requesting' ? 'not-allowed' : 'pointer' }}>
                  {gpsStatus === 'requesting' ? '⏳ Getting location...' : '▶ Start GPS'}
                </button>
              ) : (
                <button onClick={stopGPS} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  ⏹ Stop GPS
                </button>
              )}
            </div>
          </div>

          {gpsStatus === 'error' && gpsError && (
            <div style={{ marginTop: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
              ⚠️ {gpsError} — use the Simulate buttons below as fallback.
            </div>
          )}

          {insideZones.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {insideZones.map(zone => (
                <div key={zone._id} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#166534', fontWeight: 600 }}>
                  🎯 You are inside <strong>{zone.name}</strong> — notification pipeline running!
                </div>
              ))}
            </div>
          )}

          {gpsStatus === 'active' && nearbyZones.length > 0 && insideZones.length === 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {nearbyZones.map(zone => {
                const color = typeColors[zone.zoneType] || '#6b7280'
                const pct   = Math.max(0, Math.min(100, 100 - ((zone.distanceMeters - zone.radiusMeters) / zone.radiusMeters) * 100))
                return (
                  <div key={zone._id} style={{ background: '#f9fafb', border: `1px solid ${color}30`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, minWidth: 180 }}>
                    <div style={{ fontWeight: 600, color: '#111', marginBottom: 4 }}>{zone.name}</div>
                    <div style={{ color: '#6b7280', marginBottom: 6 }}>{zone.distanceMeters <= zone.radiusMeters ? '🟢 Inside zone' : `📏 ${zone.distanceMeters}m away`}</div>
                    <div style={{ height: 4, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Live Map */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>🗺️ Live Zone Map</div>
            {gpsStatus === 'active' && <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 500 }}>● Live · ±{Math.round(gpsPos?.accuracy || 0)}m accuracy</span>}
          </div>
          <div style={{ height: 380 }}>
            <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {gpsPos && <MapController center={[gpsPos.lat, gpsPos.lng]} />}
              {zones.map(zone => {
                const [zLng, zLat] = zone.centerPoint.coordinates
                const color    = typeColors[zone.zoneType] || '#6b7280'
                const isInside = insideZones.some(z => z._id === zone._id)
                return (
                  <Circle key={zone._id} center={[zLat, zLng]} radius={zone.radiusMeters}
                    pathOptions={{ color, fillColor: color, fillOpacity: isInside ? 0.25 : 0.1, weight: isInside ? 2.5 : 1.5, dashArray: isInside ? null : '4 4' }}>
                    <Popup>
                      <strong>{zone.name}</strong><br />
                      {zone.project?.name?.en && <span>{zone.project.name.en}<br /></span>}
                      {zone.project?.completionPercentage != null && <span>✅ {zone.project.completionPercentage}% complete</span>}
                    </Popup>
                  </Circle>
                )
              })}
              {gpsPos && (
                <Marker position={[gpsPos.lat, gpsPos.lng]} icon={userIcon}>
                  <Popup>📍 You are here<br />{gpsPos.lat.toFixed(5)}, {gpsPos.lng.toFixed(5)}</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>

        {/* How it works */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 14 }}>How the real GPS flow works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Click "Start GPS" — browser asks for location permission',
              'Your live location appears as a blue dot on the map',
              'Every 8 seconds your coordinates are sent to the backend',
              'Backend checks if you\'re inside any zone + runs dwell & dedup logic',
              'When dwell time is met inside a zone → push notification fires automatically',
              'Use "Simulate Zone Entry" below to demo without physically moving',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: '#374151', paddingTop: 3, lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zone cards */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Active Zones ({zones.length})</h2>
          <button onClick={fetchData} style={{ background: '#fff', border: '1px solid #d1d5db', color: '#374151', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>↻ Refresh</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 16, marginBottom: 40 }}>
          {zones.map(zone => {
            const color    = typeColors[zone.zoneType] || '#6b7280'
            const isSim    = simulating === zone._id
            const distInfo = nearbyZones.find(z => z._id === zone._id)
            const isInside = insideZones.some(z => z._id === zone._id)
            return (
              <div key={zone._id} style={{ background: '#fff', border: `1px solid ${isInside ? color : '#e5e7eb'}`, borderRadius: 12, padding: 20, borderTop: `3px solid ${color}`, display: 'flex', flexDirection: 'column', boxShadow: isInside ? `0 0 0 3px ${color}25` : 'none', transition: 'box-shadow 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.3, flex: 1, marginRight: 8 }}>{zone.name}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ background: `${color}15`, color, fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase' }}>{zone.zoneType}</span>
                    {isInside && <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>● INSIDE</span>}
                  </div>
                </div>
                {zone.project && (
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, lineHeight: 1.7, color: '#374151' }}>
                    <strong>{zone.project.name?.en}</strong><br />
                    💰 ₹{((zone.project.budget?.sanctioned || 0) / 1e7).toFixed(0)} Cr &nbsp;·&nbsp; ✅ {zone.project.completionPercentage}% done<br />
                    👤 {zone.project.leader?.name || 'N/A'}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: distInfo ? 8 : 14 }}>Radius: {zone.radiusMeters}m · Dwell: {zone.dwellTimeSeconds}s</div>
                {distInfo && (
                  <div style={{ fontSize: 12, color: isInside ? '#16a34a' : '#6b7280', marginBottom: 14, fontWeight: isInside ? 600 : 400 }}>
                    {isInside ? '🎯 You are inside this zone' : `📏 ${distInfo.distanceMeters}m from zone boundary`}
                  </div>
                )}
                <button onClick={() => simulateEntry(zone)} disabled={!!simulating}
                  style={{ marginTop: 'auto', width: '100%', background: isSim ? '#f3f4f6' : color, color: isSim ? '#6b7280' : '#fff', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: simulating ? 'not-allowed' : 'pointer', transition: 'all .2s' }}>
                  {isSim ? '⏳ Simulating...' : '📍 Simulate Zone Entry'}
                </button>
              </div>
            )
          })}
          {zones.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 14 }}>No active zones — admin needs to create zones first</div>
          )}
        </div>

        {/* Notification history */}
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
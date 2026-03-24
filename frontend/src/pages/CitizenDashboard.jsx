import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import API from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

// ─── Fix default Leaflet marker icons (Vite/webpack issue) ───────────────────
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

// ─── Component to fly map to user location ───────────────────────────────────
function MapController({ center }) {
  const map = useMap()
  const initialRef = useRef(false)
  useEffect(() => {
    if (center && !initialRef.current) {
      map.flyTo(center, 15, { duration: 1.5 })
      initialRef.current = true
    }
  }, [center, map])
  return null
}

// ─── Haversine distance (same logic as geoService.js on backend) ─────────────
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
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

export default function CitizenDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [zones,         setZones]         = useState([])
  const [notifications, setNotifications] = useState([])
  const [simulating,    setSimulating]    = useState(null)
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )

  // ── GPS state ──────────────────────────────────────────────────────────────
  const [gpsPos,      setGpsPos]      = useState(null)   // { lat, lng, accuracy }
  const [gpsStatus,   setGpsStatus]   = useState('idle') // idle | requesting | active | error
  const [gpsError,    setGpsError]    = useState(null)
  const [nearbyZones, setNearbyZones] = useState([])     // zones with distance
  const [insideZones, setInsideZones] = useState([])     // zones user is currently inside

  const watchIdRef       = useRef(null)
  const lastPingRef      = useRef(0)
  const PING_INTERVAL_MS = 10_000  // ping backend every 10s max

  // ── Fetch zones + notification history ────────────────────────────────────
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

  // ── Show browser push notification ────────────────────────────────────────
  const showBrowserNotif = useCallback((zone) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const p = zone.project
    const title = p?.notificationTitle?.en || p?.name?.en || zone.name
    const body  = p?.notificationBody?.en  ||
      `₹${((p?.budget?.sanctioned || 0) / 1e7).toFixed(0)}Cr · ${p?.completionPercentage || 0}% complete · ${p?.leader?.name || ''}`
    const n = new Notification(title, { body, tag: zone._id })
    n.onclick = () => { window.focus(); n.close() }
  }, [])

  // ── Ping backend with real coordinates ────────────────────────────────────
  const pingBackend = useCallback(async (lat, lng) => {
    const now = Date.now()
    if (now - lastPingRef.current < PING_INTERVAL_MS) return
    lastPingRef.current = now

    try {
      const { data } = await API.post('/api/location/ping', { lat, lng })
      if (!data.notifications?.length) return

      for (const result of data.notifications) {
        if (result.status === 'notified') {
          const zone = zones.find(z => String(z._id) === String(result.zoneId))
          if (zone) {
            toast.success(`📍 You're inside ${zone.name} — notification fired!`)
            showBrowserNotif(zone)
          }
        } else if (result.status === 'dwell_started') {
          const zone = zones.find(z => String(z._id) === String(result.zoneId))
          if (zone) toast(`⏱ Entered ${zone.name} — dwell timer started`, { icon: '📍' })
        }
      }
      await fetchData()
    } catch (err) {
      console.error('[pingBackend]', err)
    }
  }, [zones, showBrowserNotif, fetchData])

  // ── Update proximity info when GPS position or zones change ───────────────
  const updateProximity = useCallback((lat, lng) => {
    if (!zones.length) return
    const withDist = zones.map(zone => {
      const [zLng, zLat] = zone.centerPoint.coordinates
      const dist = Math.round(getDistanceMeters(lat, lng, zLat, zLng))
      return { ...zone, distanceMeters: dist }
    }).sort((a, b) => a.distanceMeters - b.distanceMeters)

    setNearbyZones(withDist.slice(0, 3))
    setInsideZones(withDist.filter(z => z.distanceMeters <= z.radiusMeters))
  }, [zones])

  // ── Start GPS watching ─────────────────────────────────────────────────────
  const startGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error')
      setGpsError('Geolocation not supported in this browser')
      return
    }
    setGpsStatus('requesting')

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords
        setGpsPos({ lat, lng, accuracy })
        setGpsStatus('active')
        setGpsError(null)
        updateProximity(lat, lng)
        pingBackend(lat, lng)
      },
      (err) => {
        setGpsStatus('error')
        setGpsError(err.message)
        console.error('[GPS]', err)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )
  }, [updateProximity, pingBackend])

  // ── Stop GPS watching ──────────────────────────────────────────────────────
  const stopGPS = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setGpsStatus('idle')
    setGpsPos(null)
    setNearbyZones([])
    setInsideZones([])
  }, [])

  // Re-run proximity when zones load after GPS is already active
  useEffect(() => {
    if (gpsPos && zones.length) updateProximity(gpsPos.lat, gpsPos.lng)
  }, [zones]) // eslint-disable-line

  // Cleanup on unmount
  useEffect(() => () => {
    if (watchIdRef.current !== null)
      navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  // ── Request notification permission ───────────────────────────────────────
  const requestPermission = async () => {
    if (typeof Notification === 'undefined') { toast.error('Not supported in this browser'); return }
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
    if (perm === 'granted') toast.success('Notifications enabled!')
    else toast.error('Permission denied — enable in browser settings')
  }

  // ── Simulate zone entry (fallback button) ─────────────────────────────────
  const simulateEntry = async (zone) => {
    setSimulating(zone._id)
    try {
      const [lng, lat] = zone.centerPoint.coordinates
      const { data } = await API.post('/api/location/ping', {
        lat, lng, zoneId: zone._id, enteredZone: true,
      })
      const result = data.notifications?.[0]
      if (result?.status === 'notified') {
        toast.success(`Notification fired for ${zone.name}!`)
        showBrowserNotif(zone)
      } else if (result?.status === 'deduped') {
        toast(`Already notified today — showing demo notification anyway`, { icon: 'ℹ️' })
        showBrowserNotif(zone)
      } else if (result?.status?.includes('dwell')) {
        toast(`Dwell timer started — in real app wait inside zone`, { icon: '⏱' })
      } else {
        toast.success(`Zone entry simulated — showing demo notification`)
        showBrowserNotif(zone)
      }
      await fetchData()
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.error || err.message}`)
    } finally { setSimulating(null) }
  }

  // ── Map center: user location or first zone ────────────────────────────────
  const mapCenter = gpsPos
    ? [gpsPos.lat, gpsPos.lng]
    : zones.length
      ? [zones[0].centerPoint.coordinates[1], zones[0].centerPoint.coordinates[0]]
      : [28.6139, 77.2090]  // Delhi fallback

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'system-ui,-apple-system,Segoe UI,sans-serif' }}>

      {/* ── NAV ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#111' }}>
          Geo<span style={{ color: '#16a34a' }}>Sanket</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#16a34a', marginLeft: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 20 }}>Citizen</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* GPS status badge */}
          {gpsStatus === 'active' && (
            <span style={{ fontSize: 12, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
              📡 GPS Active · {gpsPos?.lat.toFixed(4)}, {gpsPos?.lng.toFixed(4)}
            </span>
          )}
          {gpsStatus === 'requesting' && (
            <span style={{ fontSize: 12, color: '#d97706', background: '#fffbeb', border: '1px solid #fcd34d', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
              ⏳ Getting GPS...
            </span>
          )}
          {gpsStatus === 'error' && (
            <span style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
              ⚠️ GPS Error
            </span>
          )}
          <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>👤 {user?.name}</span>
          <button onClick={() => { logout(); navigate('/login') }} style={{ background: 'transparent', border: '1px solid #d1d5db', color: '#374151', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111', marginBottom: 6, letterSpacing: -0.5 }}>Welcome, {user?.name} 👋</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Activate real GPS to auto-receive notifications when you physically enter a government zone — or simulate it below.
        </p>

        {/* ── Notification permission banner ── */}
        {notifPermission !== 'granted' && (
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#92400e', fontSize: 14, marginBottom: 3 }}>⚠️ Enable notifications for the full demo</div>
              <div style={{ fontSize: 13, color: '#78350f' }}>You'll see a real browser push notification when you enter a zone.</div>
            </div>
            <button onClick={requestPermission} style={{ background: '#f59e0b', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Enable Now</button>
          </div>
        )}
        {notifPermission === 'granted' && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#166534' }}>
            ✅ Notifications are enabled — you'll see a real pop-up when you enter a zone.
          </div>
        )}

        {/* ── GPS Control Panel ── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 6 }}>📡 Real GPS Tracking</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, maxWidth: 480 }}>
                Your real location is checked against all active zones every 10 seconds. Walk into a zone and the notification fires automatically — no button needed.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {gpsStatus !== 'active' ? (
                <button
                  onClick={startGPS}
                  disabled={gpsStatus === 'requesting'}
                  style={{ background: gpsStatus === 'requesting' ? '#f3f4f6' : '#16a34a', color: gpsStatus === 'requesting' ? '#6b7280' : '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: gpsStatus === 'requesting' ? 'not-allowed' : 'pointer' }}>
                  {gpsStatus === 'requesting' ? '⏳ Getting location...' : '▶ Start GPS'}
                </button>
              ) : (
                <button
                  onClick={stopGPS}
                  style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  ⏹ Stop GPS
                </button>
              )}
            </div>
          </div>

          {/* GPS error */}
          {gpsStatus === 'error' && gpsError && (
            <div style={{ marginTop: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
              ⚠️ {gpsError} — use the Simulate buttons below as fallback.
            </div>
          )}

          {/* Inside zone alert */}
          {insideZones.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {insideZones.map(zone => (
                <div key={zone._id} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#166534', fontWeight: 600 }}>
                  🎯 You are inside <strong>{zone.name}</strong> — notification pipeline is running!
                </div>
              ))}
            </div>
          )}

          {/* Proximity indicators */}
          {gpsStatus === 'active' && nearbyZones.length > 0 && insideZones.length === 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {nearbyZones.map(zone => {
                const color = typeColors[zone.zoneType] || '#6b7280'
                const pct   = Math.max(0, Math.min(100, 100 - ((zone.distanceMeters - zone.radiusMeters) / zone.radiusMeters) * 100))
                return (
                  <div key={zone._id} style={{ background: '#f9fafb', border: `1px solid ${color}30`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, minWidth: 180 }}>
                    <div style={{ fontWeight: 600, color: '#111', marginBottom: 4 }}>{zone.name}</div>
                    <div style={{ color: '#6b7280', marginBottom: 6 }}>
                      {zone.distanceMeters <= zone.radiusMeters
                        ? '🟢 Inside zone'
                        : `📏 ${zone.distanceMeters}m away`}
                    </div>
                    <div style={{ height: 4, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Live Map ── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>🗺️ Live Zone Map</div>
            {gpsStatus === 'active' && (
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 500 }}>
                ● Live · Accuracy ±{Math.round(gpsPos?.accuracy || 0)}m
              </span>
            )}
          </div>
          <div style={{ height: 380 }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Fly to user location when GPS activates */}
              {gpsPos && <MapController center={[gpsPos.lat, gpsPos.lng]} />}

              {/* Zone circles */}
              {zones.map(zone => {
                const [zLng, zLat] = zone.centerPoint.coordinates
                const color = typeColors[zone.zoneType] || '#6b7280'
                const isInside = insideZones.some(z => z._id === zone._id)
                return (
                  <Circle
                    key={zone._id}
                    center={[zLat, zLng]}
                    radius={zone.radiusMeters}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: isInside ? 0.25 : 0.1,
                      weight: isInside ? 2.5 : 1.5,
                      dashArray: isInside ? null : '4 4',
                    }}
                  >
                    <Popup>
                      <strong>{zone.name}</strong><br />
                      {zone.project?.name?.en && <span>{zone.project.name.en}<br /></span>}
                      {zone.project?.completionPercentage != null && (
                        <span>✅ {zone.project.completionPercentage}% complete</span>
                      )}
                    </Popup>
                  </Circle>
                )
              })}

              {/* Live user dot */}
              {gpsPos && (
                <Marker position={[gpsPos.lat, gpsPos.lng]} icon={userIcon}>
                  <Popup>📍 You are here<br />{gpsPos.lat.toFixed(5)}, {gpsPos.lng.toFixed(5)}</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>

        {/* ── How it works (updated steps) ── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 14 }}>How the real GPS flow works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Click "Start GPS" above — browser asks for location permission',
              'Your live location appears as a blue dot on the map',
              'Every 10 seconds your coordinates are sent to the backend',
              'Backend checks if you\'re inside any zone + runs dwell & dedup logic',
              'When dwell time is met inside a zone → notification fires automatically',
              'Use "Simulate Zone Entry" below to demo without physically moving',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: '#374151', paddingTop: 3, lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Zone cards with simulate fallback ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Active Zones ({zones.length})</h2>
          <button onClick={fetchData} style={{ background: '#fff', border: '1px solid #d1d5db', color: '#374151', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>↻ Refresh</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 16, marginBottom: 40 }}>
          {zones.map(zone => {
            const color   = typeColors[zone.zoneType] || '#6b7280'
            const isSim   = simulating === zone._id
            const distInfo = nearbyZones.find(z => z._id === zone._id)
            const isInside = insideZones.some(z => z._id === zone._id)
            return (
              <div key={zone._id} style={{ background: '#fff', border: `1px solid ${isInside ? color : '#e5e7eb'}`, borderRadius: 12, padding: 20, borderTop: `3px solid ${color}`, display: 'flex', flexDirection: 'column', boxShadow: isInside ? `0 0 0 3px ${color}25` : 'none' }}>
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

                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: distInfo ? 8 : 14 }}>
                  Radius: {zone.radiusMeters}m · Dwell: {zone.dwellTimeSeconds}s
                </div>

                {/* Distance indicator */}
                {distInfo && (
                  <div style={{ fontSize: 12, color: isInside ? '#16a34a' : '#6b7280', marginBottom: 14, fontWeight: isInside ? 600 : 400 }}>
                    {isInside ? '🎯 You are inside this zone' : `📏 ${distInfo.distanceMeters}m from zone boundary`}
                  </div>
                )}

                <button
                  onClick={() => simulateEntry(zone)}
                  disabled={!!simulating}
                  style={{ marginTop: 'auto', width: '100%', background: isSim ? '#f3f4f6' : color, color: isSim ? '#6b7280' : '#fff', border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: simulating ? 'not-allowed' : 'pointer', transition: 'all .2s' }}>
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

        {/* ── Notification history ── */}
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
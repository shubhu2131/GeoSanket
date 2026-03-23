import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet'
import { getZones } from '../../api'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'

const typeColors = {
  hospital: '#ef4444', college: '#3b82f6', bridge: '#f97316',
  road: '#22c55e', park: '#a855f7', other: '#64748b'
}

export default function MapView() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useTheme()

  const fetchZones = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getZones()
      setZones(r.data.zones)
    } catch (err) {
      toast.error(`Failed to load zones: ${err.response?.data?.error || err.message}`)
      console.error('[MapView]', err)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchZones()
    // auto-refresh every 30 seconds
    const interval = setInterval(fetchZones, 30000)
    return () => clearInterval(interval)
  }, [fetchZones])

  return (
    <div style={{ fontFamily: t.font }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 24, marginBottom: 4, color: t.text, letterSpacing: -0.5 }}>Live Map</h1>
          <p style={{ color: t.muted, fontSize: 13 }}>
            {loading ? 'Loading zones...' : `${zones.length} active zone${zones.length !== 1 ? 's' : ''} · auto-refreshes every 30s`}
          </p>
        </div>
        <button onClick={fetchZones} style={{ background: t.purple, color: '#fff', padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: t.font }}>
          ↻ Refresh now
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: t.muted }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }}></span>
            {type}
          </div>
        ))}
      </div>

      <div style={{ height: 'calc(100vh - 210px)', borderRadius: 12, overflow: 'hidden', border: `1px solid ${t.border}` }}>
        <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url={t.isDark
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            }
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {zones.map(zone => {
            if (!zone.centerPoint?.coordinates) return null
            const [lng, lat] = zone.centerPoint.coordinates
            const color = typeColors[zone.zoneType] || '#64748b'
            return (
              <Circle key={zone._id} center={[lat, lng]} radius={zone.radiusMeters}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 2 }}>
                <Popup>
                  <div style={{ fontFamily: 'system-ui,sans-serif', minWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{zone.name}</div>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8 }}>
                      📍 {zone.address || 'No address'}<br />
                      Type: <b>{zone.zoneType}</b><br />
                      Radius: <b>{zone.radiusMeters}m</b><br />
                      Dwell: <b>{zone.dwellTimeSeconds}s</b>
                    </div>
                    {zone.project && (
                      <div style={{ borderTop: '1px solid #eee', paddingTop: 8, marginTop: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{zone.project.name?.en}</div>
                        <div style={{ fontSize: 11, color: '#777', lineHeight: 1.6 }}>
                          ₹{((zone.project.budget?.sanctioned || 0) / 1e7).toFixed(0)} Cr · {zone.project.completionPercentage}% complete<br />
                          Leader: {zone.project.leader?.name || '—'}
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Circle>
            )
          })}
        </MapContainer>
      </div>

      {zones.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: t.muted, fontSize: 13 }}>
          No zones yet — go to Zones page → create one → come back and click Refresh
        </div>
      )}
    </div>
  )
}

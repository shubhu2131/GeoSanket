import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet'
import { getZones } from '../../api'
import toast from 'react-hot-toast'

const typeColors = {
  hospital: '#ef4444', college: '#3b82f6', bridge: '#f97316',
  road: '#22c55e', park: '#a855f7', other: '#64748b'
}

function RefreshButton({ onRefresh }) {
  return (
    <button onClick={onRefresh} style={{
      position: 'absolute', top: 12, right: 12, zIndex: 1000,
      background: '#0d0d1e', border: '1px solid #1a1a2e', color: '#a855f7',
      padding: '8px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
      fontFamily: 'DM Sans,sans-serif', fontWeight: 600
    }}>↻ Refresh zones</button>
  )
}

export default function MapView() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchZones = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getZones()
      setZones(r.data.zones)
    } catch (err) {
      toast.error(`Failed to load zones: ${err.response?.data?.error || err.message}`)
      console.error('[MapView] zone fetch error', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchZones() }, [fetchZones])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 2 }}>Live Map</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            {loading ? 'Loading zones...' : `${zones.length} active zone${zones.length !== 1 ? 's' : ''} in Delhi`}
          </p>
        </div>
        <button onClick={fetchZones} style={{
          background: '#7c3aed', color: '#fff', padding: '8px 18px',
          borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'DM Sans,sans-serif'
        }}>↻ Refresh</button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }}></span>
            {type}
          </div>
        ))}
      </div>

      <div style={{ height: 'calc(100vh - 210px)', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a1a2e', position: 'relative' }}>
        <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {zones.map(zone => {
            if (!zone.centerPoint?.coordinates) return null
            const [lng, lat] = zone.centerPoint.coordinates
            const color = typeColors[zone.zoneType] || '#64748b'
            return (
              <Circle
                key={zone._id}
                center={[lat, lng]}
                radius={zone.radiusMeters}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 2 }}
              >
                <Popup>
                  <div style={{ fontFamily: 'DM Sans,sans-serif', minWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{zone.name}</div>
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 3 }}>📍 {zone.address || 'No address'}</div>
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 3 }}>Type: <b>{zone.zoneType}</b></div>
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 3 }}>Radius: <b>{zone.radiusMeters}m</b></div>
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 3 }}>Dwell: <b>{zone.dwellTimeSeconds}s</b></div>
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 3 }}>
                      Coords: {lat.toFixed(4)}, {lng.toFixed(4)}
                    </div>
                    {zone.project && (
                      <div style={{ borderTop: '1px solid #eee', paddingTop: 8, marginTop: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{zone.project.name?.en}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          ₹{((zone.project.budget?.sanctioned || 0) / 1e7).toFixed(0)} Cr · {zone.project.completionPercentage}% complete
                        </div>
                        <div style={{ fontSize: 11, color: '#888' }}>Leader: {zone.project.leader?.name || '—'}</div>
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
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: 13 }}>
          No zones yet — go to Zones page to create one, then come back and click Refresh
        </div>
      )}
    </div>
  )
}
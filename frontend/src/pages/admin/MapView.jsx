import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet'
import { getZones } from '../../api'

const typeColors = { hospital: '#ef4444', college: '#3b82f6', bridge: '#f97316', road: '#22c55e', park: '#a855f7', other: '#64748b' }

export default function MapView() {
  const [zones, setZones] = useState([])

  useEffect(() => {
    getZones().then(r => setZones(r.data.zones)).catch(() => {})
  }, [])

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Live Map</h1>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>All active geo-fence zones in Delhi</p>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }}></span>
            {type}
          </div>
        ))}
      </div>

      <div style={{ height: 'calc(100vh - 200px)', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a1a2e' }}>
        <MapContainer
          center={[28.6139, 77.2090]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
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
                pathOptions={{ color, fillColor: color, fillOpacity: 0.15, weight: 2 }}
              >
                <Popup>
                  <div style={{ fontFamily: 'DM Sans,sans-serif', minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{zone.name}</div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Type: {zone.zoneType}</div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Radius: {zone.radiusMeters}m</div>
                    {zone.project && <>
                      <div style={{ fontWeight: 600, fontSize: 13, marginTop: 8, borderTop: '1px solid #eee', paddingTop: 8 }}>{zone.project.name?.en}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>₹{((zone.project.budget?.sanctioned || 0) / 1e7).toFixed(0)} Cr · {zone.project.completionPercentage}% complete</div>
                    </>}
                  </div>
                </Popup>
              </Circle>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}

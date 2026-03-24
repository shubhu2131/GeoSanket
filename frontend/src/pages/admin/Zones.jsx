import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getZones, createZone, deleteZone, getProjects } from '../../api'
import { useTheme } from '../../context/ThemeContext'

export default function Zones() {
  const [zones, setZones] = useState([])
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', projectId: '', zoneType: 'hospital', lat: '', lng: '', radiusMeters: 300, dwellTimeSeconds: 300, address: '' })
  const { t } = useTheme()

  useEffect(() => {
    getZones().then(r => setZones(r.data.zones)).catch(console.error)
    getProjects().then(r => setProjects(r.data.projects)).catch(console.error)
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const { data } = await createZone({
        ...form,
        center: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) },
        radiusMeters: parseInt(form.radiusMeters),
        dwellTimeSeconds: parseInt(form.dwellTimeSeconds),
      })
      setZones(prev => [data.zone, ...prev])
      setShowForm(false)
      setForm({ name: '', projectId: '', zoneType: 'hospital', lat: '', lng: '', radiusMeters: 300, dwellTimeSeconds: 300, address: '' })
      toast.success('Zone created!')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this zone?')) return
    try {
      await deleteZone(id)
      setZones(prev => prev.filter(z => z._id !== id))
      toast.success('Zone deleted')
    } catch { toast.error('Failed') }
  }

  const inp = { width: '100%', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px', color: t.text, fontSize: 13, outline: 'none', fontFamily: t.font, boxSizing: 'border-box' }
  const lbl = { fontSize: 11, color: t.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }
  const typeColors = { hospital: '#ef4444', college: '#3b82f6', bridge: '#f97316', road: '#22c55e', park: '#a855f7', other: '#64748b' }

  return (
    <div style={{ fontFamily: t.font }}>
      <style>{`
        .zones-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 600px) { .zones-form-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 22, marginBottom: 4, color: t.text, letterSpacing: -0.5 }}>Geo-fence Zones</h1>
          <p style={{ color: t.muted, fontSize: 13 }}>{zones.length} active zones</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: t.purple, color: '#fff', padding: '10px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: t.font, whiteSpace: 'nowrap' }}>
          + New Zone
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{ background: t.cardBg, border: `1px solid ${t.isDark ? 'rgba(124,58,237,.3)' : '#ddd6fe'}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: t.purple }}>Create New Zone</h3>
          <form onSubmit={handleCreate}>
            <div className="zones-form-grid">
              <div><label style={lbl}>Zone Name</label><input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="AIIMS Main Gate" required /></div>
              <div><label style={lbl}>Type</label>
                <select style={inp} value={form.zoneType} onChange={e => setForm({ ...form, zoneType: e.target.value })}>
                  {['hospital', 'college', 'bridge', 'road', 'park', 'other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Latitude</label><input style={inp} value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} placeholder="28.5672" required /></div>
              <div><label style={lbl}>Longitude</label><input style={inp} value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} placeholder="77.2090" required /></div>
              <div><label style={lbl}>Radius (meters)</label><input style={inp} type="number" value={form.radiusMeters} onChange={e => setForm({ ...form, radiusMeters: e.target.value })} /></div>
              <div><label style={lbl}>Dwell Time (seconds)</label><input style={inp} type="number" value={form.dwellTimeSeconds} onChange={e => setForm({ ...form, dwellTimeSeconds: e.target.value })} /></div>
              <div><label style={lbl}>Link to Project</label>
                <select style={inp} value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
                  <option value="">— None —</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name?.en}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Address</label><input style={inp} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="AIIMS, Ansari Nagar" /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              <button type="submit" style={{ background: t.purple, color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: t.font }}>Create Zone</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', color: t.muted, padding: '10px 20px', borderRadius: 8, border: `1px solid ${t.border}`, fontSize: 13, cursor: 'pointer', fontFamily: t.font }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Zone cards — works on all screen sizes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {zones.map(zone => {
          const color = typeColors[zone.zoneType] || '#64748b'
          return (
            <div key={zone._id} style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: '14px 16px', borderLeft: `3px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: t.text, marginBottom: 6 }}>{zone.name}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ background: `${color}18`, color, fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase', border: `1px solid ${color}33` }}>{zone.zoneType}</span>
                    <span style={{ fontSize: 12, color: t.muted }}>📏 {zone.radiusMeters}m</span>
                    <span style={{ fontSize: 12, color: t.muted }}>⏱ {zone.dwellTimeSeconds}s</span>
                  </div>
                  {zone.project && <div style={{ fontSize: 12, color: t.muted }}>🏛️ {zone.project.name?.en}</div>}
                  {zone.address && <div style={{ fontSize: 11, color: t.muted, marginTop: 3 }}>📍 {zone.address}</div>}
                </div>
                <button onClick={() => handleDelete(zone._id)} style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: t.font, whiteSpace: 'nowrap', flexShrink: 0 }}>Delete</button>
              </div>
            </div>
          )
        })}
        {zones.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: t.muted, fontSize: 13, background: t.cardBg, borderRadius: 12, border: `1px solid ${t.border}` }}>
            No zones yet — create one above
          </div>
        )}
      </div>
    </div>
  )
}

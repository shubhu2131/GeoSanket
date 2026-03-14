import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getZones, createZone, deleteZone, getProjects } from '../../api'

export default function Zones() {
  const [zones, setZones] = useState([])
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', projectId: '', zoneType: 'hospital', lat: '', lng: '', radiusMeters: 300, dwellTimeSeconds: 300, address: '' })

  useEffect(() => {
    getZones().then(r => setZones(r.data.zones)).catch(() => {})
    getProjects().then(r => setProjects(r.data.projects)).catch(() => {})
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

  const inputStyle = { width: '100%', background: '#080812', border: '1px solid #1a1a2e', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'DM Sans,sans-serif' }
  const labelStyle = { fontSize: 11, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Geo-fence Zones</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>{zones.length} active zones</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#7c3aed', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
          + New Zone
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{ background: '#0d0d1e', border: '1px solid rgba(124,58,237,.3)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#a855f7' }}>Create New Zone</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={labelStyle}>Zone Name</label><input style={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="AIIMS Main Gate" required /></div>
              <div><label style={labelStyle}>Type</label>
                <select style={inputStyle} value={form.zoneType} onChange={e => setForm({...form, zoneType: e.target.value})}>
                  {['hospital','college','bridge','road','park','other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Latitude</label><input style={inputStyle} value={form.lat} onChange={e => setForm({...form, lat: e.target.value})} placeholder="28.5672" required /></div>
              <div><label style={labelStyle}>Longitude</label><input style={inputStyle} value={form.lng} onChange={e => setForm({...form, lng: e.target.value})} placeholder="77.2090" required /></div>
              <div><label style={labelStyle}>Radius (meters)</label><input style={inputStyle} type="number" value={form.radiusMeters} onChange={e => setForm({...form, radiusMeters: e.target.value})} /></div>
              <div><label style={labelStyle}>Dwell Time (seconds)</label><input style={inputStyle} type="number" value={form.dwellTimeSeconds} onChange={e => setForm({...form, dwellTimeSeconds: e.target.value})} /></div>
              <div><label style={labelStyle}>Link to Project</label>
                <select style={inputStyle} value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})}>
                  <option value="">— None —</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name?.en}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Address</label><input style={inputStyle} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="AIIMS, Ansari Nagar" /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="submit" style={{ background: '#7c3aed', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Create Zone</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#64748b', padding: '10px 24px', borderRadius: 8, border: '1px solid #1a1a2e', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a2e' }}>
              {['Zone Name', 'Type', 'Radius', 'Dwell', 'Project', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map(zone => (
              <tr key={zone._id} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: 14 }}>{zone.name}</td>
                <td style={{ padding: '14px 20px' }}><span style={{ background: 'rgba(168,85,247,.1)', color: '#a855f7', fontSize: 11, padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(168,85,247,.2)' }}>{zone.zoneType}</span></td>
                <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: 13 }}>{zone.radiusMeters}m</td>
                <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: 13 }}>{zone.dwellTimeSeconds}s</td>
                <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 13 }}>{zone.project?.name?.en || '—'}</td>
                <td style={{ padding: '14px 20px' }}>
                  <button onClick={() => handleDelete(zone._id)} style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)', padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Delete</button>
                </td>
              </tr>
            ))}
            {zones.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>No zones yet — create one above</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

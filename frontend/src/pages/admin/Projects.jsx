import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getProjects, createProject, deleteProject } from '../../api'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nameEn: '', nameHi: '', descEn: '', descHi: '', projectType: 'hospital', leaderName: '', leaderDesignation: '', budgetSanctioned: '', budgetSpent: '', completionPercentage: 0, status: 'in_progress', scheme: '', department: '', notifTitleEn: '', notifBodyEn: '' })

  useEffect(() => {
    getProjects().then(r => setProjects(r.data.projects)).catch(() => {})
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: { en: form.nameEn, hi: form.nameHi },
        description: { en: form.descEn, hi: form.descHi },
        projectType: form.projectType,
        leader: { name: form.leaderName, designation: form.leaderDesignation },
        budget: { sanctioned: parseFloat(form.budgetSanctioned) * 1e7, spent: parseFloat(form.budgetSpent) * 1e7 },
        completionPercentage: parseInt(form.completionPercentage),
        status: form.status, scheme: form.scheme, department: form.department,
        notificationTitle: { en: form.notifTitleEn },
        notificationBody: { en: form.notifBodyEn },
        isVerified: true, isActive: true
      }
      const { data } = await createProject(payload)
      setProjects(prev => [data.project, ...prev])
      setShowForm(false)
      toast.success('Project created!')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    try {
      await deleteProject(id)
      setProjects(prev => prev.filter(p => p._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  const inputStyle = { width: '100%', background: '#080812', border: '1px solid #1a1a2e', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'DM Sans,sans-serif' }
  const labelStyle = { fontSize: 11, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }
  const statusColors = { completed: '#22c55e', in_progress: '#f97316', planned: '#3b82f6', on_hold: '#64748b' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Govt Projects</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>{projects.length} projects in database</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#7c3aed', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
          + New Project
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#0d0d1e', border: '1px solid rgba(124,58,237,.3)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#a855f7' }}>Add New Project</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={labelStyle}>Name (English)</label><input style={inputStyle} value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} placeholder="AIIMS Trauma Centre" required /></div>
              <div><label style={labelStyle}>Name (Hindi)</label><input style={inputStyle} value={form.nameHi} onChange={e => setForm({...form, nameHi: e.target.value})} placeholder="एम्स ट्रॉमा सेंटर" /></div>
              <div><label style={labelStyle}>Description (EN)</label><input style={inputStyle} value={form.descEn} onChange={e => setForm({...form, descEn: e.target.value})} placeholder="Project description" /></div>
              <div><label style={labelStyle}>Type</label>
                <select style={inputStyle} value={form.projectType} onChange={e => setForm({...form, projectType: e.target.value})}>
                  {['hospital','college','bridge','road','park','water','other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Leader Name</label><input style={inputStyle} value={form.leaderName} onChange={e => setForm({...form, leaderName: e.target.value})} placeholder="Arvind Kejriwal" /></div>
              <div><label style={labelStyle}>Designation</label><input style={inputStyle} value={form.leaderDesignation} onChange={e => setForm({...form, leaderDesignation: e.target.value})} placeholder="Chief Minister, Delhi" /></div>
              <div><label style={labelStyle}>Budget Sanctioned (₹ Cr)</label><input style={inputStyle} type="number" value={form.budgetSanctioned} onChange={e => setForm({...form, budgetSanctioned: e.target.value})} placeholder="85" /></div>
              <div><label style={labelStyle}>Budget Spent (₹ Cr)</label><input style={inputStyle} type="number" value={form.budgetSpent} onChange={e => setForm({...form, budgetSpent: e.target.value})} placeholder="72" /></div>
              <div><label style={labelStyle}>Completion %</label><input style={inputStyle} type="number" value={form.completionPercentage} onChange={e => setForm({...form, completionPercentage: e.target.value})} placeholder="95" /></div>
              <div><label style={labelStyle}>Status</label>
                <select style={inputStyle} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  {['planned','in_progress','completed','on_hold'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Scheme</label><input style={inputStyle} value={form.scheme} onChange={e => setForm({...form, scheme: e.target.value})} placeholder="PMAY Health" /></div>
              <div><label style={labelStyle}>Department</label><input style={inputStyle} value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="Health & Family Welfare" /></div>
              <div><label style={labelStyle}>Notification Title</label><input style={inputStyle} value={form.notifTitleEn} onChange={e => setForm({...form, notifTitleEn: e.target.value})} placeholder="AIIMS Trauma Centre" /></div>
              <div><label style={labelStyle}>Notification Body</label><input style={inputStyle} value={form.notifBodyEn} onChange={e => setForm({...form, notifBodyEn: e.target.value})} placeholder="₹85Cr project · 4800+ surgeries" /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="submit" style={{ background: '#7c3aed', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Create Project</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#64748b', padding: '10px 24px', borderRadius: 8, border: '1px solid #1a1a2e', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
        {projects.map(p => (
          <div key={p._id} style={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 12, padding: 20, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{p.name?.en}</div>
                {p.name?.hi && <div style={{ fontSize: 12, color: '#64748b' }}>{p.name.hi}</div>}
              </div>
              <span style={{ background: `${statusColors[p.status]}18`, color: statusColors[p.status], border: `1px solid ${statusColors[p.status]}33`, fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, whiteSpace: 'nowrap' }}>{p.status?.replace('_', ' ')}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div style={{ background: '#080812', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>BUDGET</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#a855f7' }}>₹{((p.budget?.sanctioned || 0) / 1e7).toFixed(0)} Cr</div>
              </div>
              <div style={{ background: '#080812', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>COMPLETION</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>{p.completionPercentage}%</div>
              </div>
            </div>
            {p.leader?.name && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>👤 {p.leader.name} · {p.leader.designation}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleDelete(p._id)} style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)', padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Delete</button>
              {p.isVerified && <span style={{ background: 'rgba(34,197,94,.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,.2)', padding: '5px 12px', borderRadius: 6, fontSize: 11 }}>✓ Verified</span>}
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: 13 }}>No projects yet — add one above or run npm run seed</div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getProjects, createProject, deleteProject } from '../../api'
import { useTheme } from '../../context/ThemeContext'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nameEn: '', nameHi: '', descEn: '', projectType: 'hospital', leaderName: '', leaderDesignation: '', budgetSanctioned: '', budgetSpent: '', completionPercentage: 0, status: 'in_progress', scheme: '', department: '', notifTitleEn: '', notifBodyEn: '' })
  const { t } = useTheme()

  useEffect(() => {
    getProjects().then(r => setProjects(r.data.projects)).catch(console.error)
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: { en: form.nameEn, hi: form.nameHi },
        description: { en: form.descEn },
        projectType: form.projectType,
        leader: { name: form.leaderName, designation: form.leaderDesignation },
        budget: { sanctioned: parseFloat(form.budgetSanctioned) * 1e7, spent: parseFloat(form.budgetSpent || 0) * 1e7 },
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

  const inp = { width: '100%', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px', color: t.text, fontSize: 13, outline: 'none', fontFamily: t.font, boxSizing: 'border-box' }
  const lbl = { fontSize: 11, color: t.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }
  const statusColors = { completed: '#22c55e', in_progress: '#f97316', planned: '#3b82f6', on_hold: '#64748b' }

  return (
    <div style={{ fontFamily: t.font }}>
      <style>{`
        .proj-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .proj-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        @media (max-width: 600px) {
          .proj-form-grid { grid-template-columns: 1fr; }
          .proj-cards { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 22, marginBottom: 4, color: t.text, letterSpacing: -0.5 }}>Govt Projects</h1>
          <p style={{ color: t.muted, fontSize: 13 }}>{projects.length} projects in database</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: t.purple, color: '#fff', padding: '10px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: t.font, whiteSpace: 'nowrap' }}>
          + New Project
        </button>
      </div>

      {showForm && (
        <div style={{ background: t.cardBg, border: `1px solid ${t.isDark ? 'rgba(124,58,237,.3)' : '#ddd6fe'}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: t.purple }}>Add New Project</h3>
          <form onSubmit={handleCreate}>
            <div className="proj-form-grid">
              <div><label style={lbl}>Name (English)</label><input style={inp} value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} placeholder="AIIMS Trauma Centre" required /></div>
              <div><label style={lbl}>Name (Hindi)</label><input style={inp} value={form.nameHi} onChange={e => setForm({ ...form, nameHi: e.target.value })} placeholder="एम्स ट्रॉमा सेंटर" /></div>
              <div><label style={lbl}>Description</label><input style={inp} value={form.descEn} onChange={e => setForm({ ...form, descEn: e.target.value })} placeholder="Brief description" /></div>
              <div><label style={lbl}>Type</label>
                <select style={inp} value={form.projectType} onChange={e => setForm({ ...form, projectType: e.target.value })}>
                  {['hospital', 'college', 'bridge', 'road', 'park', 'water', 'other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Leader Name</label><input style={inp} value={form.leaderName} onChange={e => setForm({ ...form, leaderName: e.target.value })} placeholder="Arvind Kejriwal" /></div>
              <div><label style={lbl}>Designation</label><input style={inp} value={form.leaderDesignation} onChange={e => setForm({ ...form, leaderDesignation: e.target.value })} placeholder="Chief Minister, Delhi" /></div>
              <div><label style={lbl}>Budget Sanctioned (₹ Cr)</label><input style={inp} type="number" value={form.budgetSanctioned} onChange={e => setForm({ ...form, budgetSanctioned: e.target.value })} placeholder="85" /></div>
              <div><label style={lbl}>Completion %</label><input style={inp} type="number" value={form.completionPercentage} onChange={e => setForm({ ...form, completionPercentage: e.target.value })} placeholder="95" /></div>
              <div><label style={lbl}>Status</label>
                <select style={inp} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {['planned', 'in_progress', 'completed', 'on_hold'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Scheme</label><input style={inp} value={form.scheme} onChange={e => setForm({ ...form, scheme: e.target.value })} placeholder="PMAY Health" /></div>
              <div><label style={lbl}>Notification Title</label><input style={inp} value={form.notifTitleEn} onChange={e => setForm({ ...form, notifTitleEn: e.target.value })} placeholder="AIIMS Trauma Centre" /></div>
              <div><label style={lbl}>Notification Body</label><input style={inp} value={form.notifBodyEn} onChange={e => setForm({ ...form, notifBodyEn: e.target.value })} placeholder="₹85Cr · 95% complete" /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              <button type="submit" style={{ background: t.purple, color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: t.font }}>Create Project</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', color: t.muted, padding: '10px 20px', borderRadius: 8, border: `1px solid ${t.border}`, fontSize: 13, cursor: 'pointer', fontFamily: t.font }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="proj-cards">
        {projects.map(p => {
          const sc = statusColors[p.status] || '#64748b'
          return (
            <div key={p._id} style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: t.text, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name?.en}</div>
                  {p.name?.hi && <div style={{ fontSize: 12, color: t.muted }}>{p.name.hi}</div>}
                </div>
                <span style={{ background: `${sc}18`, color: sc, border: `1px solid ${sc}33`, fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {p.status?.replace('_', ' ')}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div style={{ background: t.inputBg, borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: t.muted, marginBottom: 2 }}>BUDGET</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: t.purple }}>₹{((p.budget?.sanctioned || 0) / 1e7).toFixed(0)} Cr</div>
                </div>
                <div style={{ background: t.inputBg, borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: t.muted, marginBottom: 2 }}>DONE</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: t.green }}>{p.completionPercentage}%</div>
                </div>
              </div>
              {p.leader?.name && <div style={{ fontSize: 12, color: t.muted, marginBottom: 12 }}>👤 {p.leader.name}</div>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => handleDelete(p._id)} style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)', padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: t.font }}>Delete</button>
                {p.isVerified && <span style={{ background: 'rgba(34,197,94,.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,.2)', padding: '5px 10px', borderRadius: 6, fontSize: 11 }}>✓ Verified</span>}
              </div>
            </div>
          )
        })}
        {projects.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: t.muted, fontSize: 13, background: t.cardBg, borderRadius: 12, border: `1px solid ${t.border}` }}>
            No projects yet — add one above or run npm run seed
          </div>
        )}
      </div>
    </div>
  )
}

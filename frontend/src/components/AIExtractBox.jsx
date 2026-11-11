// frontend/src/components/AIExtractBox.jsx
import { useState } from 'react'
import toast from 'react-hot-toast'
import { extractProject } from '../api'
import { useTheme } from '../context/ThemeContext'

const SAMPLE = `The Delhi Government yesterday inaugurated the AIIMS Trauma Centre Expansion at a sanctioned cost of Rs. 85 crore, of which Rs. 72 crore has been spent. Delhi Chief Minister Arvind Kejriwal said 95% of the work is complete. The project was executed under the PMAY Health scheme by the Department of Health & Family Welfare.`

const LABELS = {
  name: 'Name', projectType: 'Type', budgetSanctioned: 'Budget', budgetSpent: 'Spent',
  completionPercentage: 'Completion', status: 'Status', leaderName: 'Leader',
  scheme: 'Scheme', department: 'Department',
}

export default function AIExtractBox({ onApply }) {
  const { t } = useTheme()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [conf, setConf] = useState(null)

  const run = async () => {
    if (text.trim().length < 20) { toast.error('Paste at least a sentence or two'); return }
    setLoading(true)
    const tid = toast.loading('AI is reading the document… (first call may take ~30s)')
    try {
      const { data } = await extractProject(text)
      onApply(data.formFields)
      setConf(data.confidence)
      const found = Object.entries(data.confidence).filter(([, v]) => v > 0).length
      toast.success(`Extracted ${found}/${Object.keys(LABELS).length} fields — review before saving`, { id: tid })
    } catch (err) {
      toast.error(err.response?.data?.error || err.message, { id: tid })
      console.error('[AIExtract]', err)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ background: t.isDark ? 'rgba(124,58,237,.08)' : '#f5f3ff', border: `1px solid ${t.isDark ? 'rgba(124,58,237,.3)' : '#ddd6fe'}`, borderRadius: 12, padding: 16, marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: t.purple }}>✨ Auto-fill from government text (AI)</div>
        <button type="button" onClick={() => setText(SAMPLE)} style={{ background: 'transparent', border: `1px solid ${t.border}`, color: t.muted, padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Load sample</button>
      </div>
      <textarea
        value={text} onChange={e => setText(e.target.value)} rows={4}
        placeholder="Paste a press release / gazette paragraph here…"
        style={{ width: '100%', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: 10, color: t.text, fontSize: 13, fontFamily: t.font, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
      />
      <button type="button" onClick={run} disabled={loading} style={{ marginTop: 10, background: t.purple, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
        {loading ? 'Extracting…' : 'Extract & fill form'}
      </button>
      {conf && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {Object.entries(LABELS).map(([k, label]) => {
            const c = conf[k] || 0
            const color = c >= 0.85 ? '#22c55e' : c > 0 ? '#f59e0b' : '#ef4444'
            return (
              <span key={k} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: `${color}18`, color, border: `1px solid ${color}40`, fontWeight: 600 }}>
                {label} {c > 0 ? `${Math.round(c * 100)}%` : 'not found'}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

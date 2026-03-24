import { useEffect, useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getTimeline, getByZone } from '../../api'
import { useTheme } from '../../context/ThemeContext'

const COLORS = ['#7c3aed', '#3b82f6', '#22c55e', '#f97316', '#ef4444']

export default function Analytics() {
  const [timeline, setTimeline] = useState([])
  const [byZone, setByZone] = useState([])
  const { t } = useTheme()

  useEffect(() => {
    getTimeline(14).then(r => setTimeline(r.data.timeline)).catch(console.error)
    getByZone().then(r => setByZone(r.data.stats)).catch(console.error)
  }, [])

  return (
    <div style={{ fontFamily: t.font }}>
      <style>{`
        .analytics-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        @media (max-width: 640px) { .analytics-charts { grid-template-columns: 1fr; } }
      `}</style>

      <h1 style={{ fontWeight: 800, fontSize: 22, marginBottom: 4, color: t.text, letterSpacing: -0.5 }}>Analytics</h1>
      <p style={{ color: t.muted, fontSize: 13, marginBottom: 20 }}>Notification trends and zone performance</p>

      <div className="analytics-charts">
        <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, minWidth: 0 }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: t.text }}>Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={timeline}>
              <XAxis dataKey="_id" tick={{ fill: t.muted, fontSize: 9 }} />
              <YAxis tick={{ fill: t.muted, fontSize: 9 }} width={20} />
              <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 11 }} />
              <Bar dataKey="count" fill={t.purple} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, minWidth: 0 }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: t.text }}>Notifications by Zone</h3>
          {byZone.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byZone} dataKey="totalNotifications" nameKey="zoneName" cx="50%" cy="50%" outerRadius={70}>
                  {byZone.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted, fontSize: 13 }}>No data yet</div>
          )}
        </div>
      </div>

      {/* Zone stats as cards on mobile */}
      <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}` }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: t.text }}>Zone Breakdown</h3>
        </div>
        {byZone.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: t.muted, fontSize: 13 }}>No analytics data yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                  {['Zone', 'Type', 'Notifications', 'Unique Users'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: t.muted, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byZone.map((z, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, color: t.text }}>{z.zoneName || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: t.muted }}>{z.zoneType || '—'}</td>
                    <td style={{ padding: '12px 16px', color: t.purple, fontWeight: 700, fontSize: 14 }}>{z.totalNotifications}</td>
                    <td style={{ padding: '12px 16px', color: t.green, fontWeight: 700, fontSize: 14 }}>{z.uniqueUserCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

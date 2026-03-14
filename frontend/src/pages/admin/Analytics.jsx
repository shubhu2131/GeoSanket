import { useEffect, useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getTimeline, getByZone } from '../../api'

const COLORS = ['#7c3aed','#3b82f6','#22c55e','#f97316','#ef4444']

export default function Analytics() {
  const [timeline, setTimeline] = useState([])
  const [byZone, setByZone] = useState([])

  useEffect(() => {
    getTimeline(14).then(r => setTimeline(r.data.timeline)).catch(() => {})
    getByZone().then(r => setByZone(r.data.stats)).catch(() => {})
  }, [])

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Analytics</h1>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>Notification trends and zone performance</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeline}>
              <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="count" fill="#7c3aed" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Notifications by Zone</h3>
          {byZone.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byZone} dataKey="totalNotifications" nameKey="zoneName" cx="50%" cy="50%" outerRadius={80}>
                  {byZone.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>No zone data yet</div>
          )}
        </div>
      </div>
      <div style={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #1a1a2e' }}>
            {['Zone', 'Type', 'Total Notifications', 'Unique Users'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {byZone.map((z, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: 14 }}>{z.zoneName || '—'}</td>
                <td style={{ padding: '14px 20px', fontSize: 13, color: '#94a3b8' }}>{z.zoneType || '—'}</td>
                <td style={{ padding: '14px 20px', color: '#a855f7', fontWeight: 700 }}>{z.totalNotifications}</td>
                <td style={{ padding: '14px 20px', color: '#22c55e', fontWeight: 700 }}>{z.uniqueUserCount}</td>
              </tr>
            ))}
            {byZone.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>No analytics data yet — notifications will populate this</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getOverview, getTimeline } from '../../api'
import { useSocket } from '../../context/SocketContext'
import { format } from 'date-fns'

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 12, padding: '20px 24px', borderLeft: `3px solid ${color}` }}>
    <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color }}>{value ?? '—'}</div>
    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [timeline, setTimeline] = useState([])
  const { liveEvents } = useSocket()

  useEffect(() => {
    getOverview().then(r => setStats(r.data.stats)).catch(() => {})
    getTimeline(7).then(r => setTimeline(r.data.timeline)).catch(() => {})
  }, [])

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Dashboard</h1>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>Live overview of GeoSanket activity</p>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon="👥" label="Total Users" value={stats?.totalUsers} color="#3b82f6" />
        <StatCard icon="📍" label="Active Zones" value={stats?.totalZones} color="#a855f7" />
        <StatCard icon="🔔" label="Total Notifications" value={stats?.totalNotifications} color="#22c55e" />
        <StatCard icon="📅" label="Today" value={stats?.todayNotifications} color="#f97316" />
        <StatCard icon="✅" label="Delivery Rate" value={stats?.deliveryRate} color="#22c55e" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Chart */}
        <div style={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Notifications — Last 7 Days</h3>
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={timeline}>
                <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>No data yet — notifications will appear here</div>
          )}
        </div>

        {/* Live feed */}
        <div style={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15 }}>Live Feed</h3>
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {liveEvents.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>Waiting for live events...</div>
            ) : liveEvents.map(ev => (
              <div key={ev.id} style={{ background: '#080812', border: '1px solid #1a1a2e', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#a855f7' }}>{ev.zoneName}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{ev.projectName}</div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>{format(new Date(ev.timestamp), 'HH:mm:ss')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

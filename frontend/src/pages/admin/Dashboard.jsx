import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getOverview, getTimeline } from '../../api'
import { useSocket } from '../../context/SocketContext'
import { useTheme } from '../../context/ThemeContext'
import { format } from 'date-fns'

const StatCard = ({ icon, label, value, color, t }) => (
  <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: '16px 20px', borderLeft: `3px solid ${color}` }}>
    <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
    <div style={{ fontFamily: t.font, fontWeight: 800, fontSize: 26, color }}>{value ?? '—'}</div>
    <div style={{ fontSize: 11, color: t.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [timeline, setTimeline] = useState([])
  const { liveEvents } = useSocket()
  const { t } = useTheme()

  useEffect(() => {
    getOverview().then(r => setStats(r.data.stats)).catch(console.error)
    getTimeline(7).then(r => setTimeline(r.data.timeline)).catch(console.error)
  }, [])

  return (
    <div style={{ fontFamily: t.font }}>
      <style>{`
        .dash-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .dash-bottom { display: grid; grid-template-columns: 1fr 320px; gap: 16px; }
        @media (max-width: 768px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr); }
          .dash-bottom { grid-template-columns: 1fr; }
        }
        @media (max-width: 400px) {
          .dash-stats { grid-template-columns: 1fr; }
        }
      `}</style>

      <h1 style={{ fontWeight: 800, fontSize: 22, marginBottom: 4, color: t.text, letterSpacing: -0.5 }}>Dashboard</h1>
      <p style={{ color: t.muted, fontSize: 13, marginBottom: 20 }}>Live overview of GeoSanket activity</p>

      <div className="dash-stats">
        <StatCard icon="👥" label="Total Users" value={stats?.totalUsers} color={t.blue} t={t} />
        <StatCard icon="📍" label="Active Zones" value={stats?.totalZones} color={t.purple} t={t} />
        <StatCard icon="🔔" label="Notifications" value={stats?.totalNotifications} color={t.green} t={t} />
        <StatCard icon="📅" label="Today" value={stats?.todayNotifications} color={t.orange} t={t} />
        <StatCard icon="✅" label="Delivery Rate" value={stats?.deliveryRate} color={t.green} t={t} />
      </div>

      <div className="dash-bottom">
        {/* Chart */}
        <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, minWidth: 0 }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: t.text }}>Notifications — Last 7 Days</h3>
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeline}>
                <XAxis dataKey="_id" tick={{ fill: t.muted, fontSize: 10 }} />
                <YAxis tick={{ fill: t.muted, fontSize: 10 }} width={24} />
                <Tooltip contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 12 }} />
                <Bar dataKey="count" fill={t.purple} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted, fontSize: 13 }}>
              No data yet
            </div>
          )}
        </div>

        {/* Live feed */}
        <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
            <h3 style={{ fontWeight: 700, fontSize: 14, color: t.text }}>Live Feed</h3>
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {liveEvents.length === 0 ? (
              <div style={{ color: t.muted, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>Waiting for live events...</div>
            ) : liveEvents.map(ev => (
              <div key={ev.id} style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.purple }}>{ev.zoneName}</div>
                <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>{ev.projectName}</div>
                <div style={{ fontSize: 10, color: t.muted, marginTop: 3 }}>{format(new Date(ev.timestamp), 'HH:mm:ss')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

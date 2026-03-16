import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } })
    }, { threshold: 0.1 })
    reveals.forEach(r => io.observe(r))
    return () => io.disconnect()
  }, [])

  return (
    <div style={{ background: '#05050f', color: '#fff', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.8)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes zonePulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.1);opacity:1}}
        @keyframes moveUser{0%{top:70%;left:10%}25%{top:35%;left:25%}50%{top:30%;left:22%}75%{top:35%;left:35%}100%{top:70%;left:10%}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        .reveal{opacity:0;transform:translateY(30px);transition:opacity .6s,transform .6s}
        .reveal.visible{opacity:1;transform:translateY(0)}
        .btn-primary{background:#7c3aed;color:#fff;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;border:none;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .btn-primary:hover{background:#6d28d9;transform:translateY(-2px);box-shadow:0 8px 30px rgba(124,58,237,.4)}
        .btn-secondary{background:transparent;color:#fff;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:500;border:1px solid #1a1a2e;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .btn-secondary:hover{border-color:#a855f7;color:#a855f7;transform:translateY(-2px)}
        .feat-card{background:#0f0f20;border:1px solid #1a1a2e;border-radius:12px;padding:28px;transition:all .3s;position:relative;overflow:hidden}
        .feat-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.4);border-color:rgba(255,255,255,.1)}
        .flow-node{background:#0f0f20;border:1px solid #1a1a2e;border-radius:12px;padding:20px 24px;text-align:center;min-width:140px;transition:all .3s}
        .flow-node:hover{border-color:#a855f7;transform:translateY(-4px);box-shadow:0 12px 40px rgba(124,58,237,.2)}
        .tech-card{background:#0f0f20;border:1px solid #1a1a2e;border-radius:10px;padding:18px 20px;display:flex;align-items:center;gap:12px;transition:all .2s}
        .tech-card:hover{border-color:rgba(255,255,255,.1);transform:translateX(4px)}
        .nav-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 10px #22c55e;animation:pulse 2s infinite;display:inline-block}
      `}</style>

      {/* Live bar */}
      <div style={{ background: 'rgba(34,197,94,.08)', borderBottom: '1px solid rgba(34,197,94,.2)', padding: '8px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, color: '#22c55e' }}>
        <span className="nav-dot"></span>
        Prototype Live — India Innovates 2026 · Municipal Corporation of Delhi · Team GeoSanket
      </div>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,.04)', backdropFilter: 'blur(20px)', background: 'rgba(5,5,15,.8)' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>Geo<span style={{ color: '#a855f7' }}>Sanket</span></div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn-secondary" style={{ padding: '8px 20px', fontSize: 13 }} onClick={() => navigate('/admin/login')}>Admin Panel →</button>
          <span className="nav-dot"></span>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '100px 40px 80px', position: 'relative' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,.15) 0%,transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}></div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.3)', padding: '6px 16px', borderRadius: 20, fontSize: 12, color: '#a855f7', marginBottom: 32, animation: 'fadeUp .6s ease both' }}>
          <span className="nav-dot" style={{ width: 6, height: 6 }}></span> Hyper-Local Civic Awareness Engine
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(42px,7vw,88px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: -2, marginBottom: 24, animation: 'fadeUp .6s .1s ease both' }}>
          Your city.<br />
          <span style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Explained in place.</span>
        </h1>
        <p style={{ fontSize: 'clamp(15px,2vw,19px)', color: '#64748b', maxWidth: 560, lineHeight: 1.7, marginBottom: 48, animation: 'fadeUp .6s .2s ease both' }}>
          Citizens get <strong style={{ color: 'rgba(255,255,255,.7)', fontWeight: 400 }}>verified government project data</strong> the moment they physically enter a geo-fenced zone — <strong style={{ color: 'rgba(255,255,255,.7)', fontWeight: 400 }}>zero manual input, zero friction.</strong>
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeUp .6s .3s ease both' }}>
          <button className="btn-primary" onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })}>See How It Works</button>
          <button className="btn-secondary" onClick={() => navigate('/admin/login')}>Admin Dashboard →</button>
        </div>
      </section>

      {/* Stats */}
      <div className="reveal" style={{ background: '#0d0d1e', borderTop: '1px solid #1a1a2e', borderBottom: '1px solid #1a1a2e', padding: '20px 40px', display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap' }}>
        {[['500M+', 'Reachable via govt apps'], ['650ms', 'Entry to notification'], ['~2%', 'Battery impact'], ['0', 'Steps for citizen']].map(([v, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#a855f7' }}>{v}</div>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <section id="how" style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 11, color: '#a855f7', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 24, height: 1, background: '#a855f7', display: 'inline-block' }}></span>How It Works
        </div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: -1, marginBottom: 16 }}>Four steps. Fully automatic.</h2>
        <p style={{ color: '#64748b', fontSize: 16, maxWidth: 500, lineHeight: 1.7, marginBottom: 48 }}>The citizen does nothing. Their physical presence is the only input needed.</p>
        <div className="reveal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
          {[
            { icon: '📍', label: 'GPS Entry', sub: 'OS-level hardware\n~80% accuracy' },
            { icon: '⚙️', label: 'Business Logic', sub: 'Node.js + Redis\nDwell · Dedup' },
            { icon: '🏛️', label: 'Govt Database', sub: 'MongoDB GeoJSON\nVerified data' },
            { icon: '🔔', label: 'Notification', sub: 'Firebase FCM\nHindi + English' },
          ].map((n, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div className="flow-node">
                <div style={{ fontSize: 28, marginBottom: 8 }}>{n.icon}</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13 }}>{n.label}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, whiteSpace: 'pre-line' }}>{n.sub}</div>
              </div>
              {i < 3 && <div style={{ color: '#a855f7', fontSize: 22, padding: '0 8px', opacity: .6 }}>→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 11, color: '#a855f7', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 24, height: 1, background: '#a855f7', display: 'inline-block' }}></span>Key Features
        </div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: -1, marginBottom: 40 }}>Built to be honest.</h2>
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
          {[
            { icon: '📵', title: 'Zero Friction Onboarding', body: 'No sign-up. No login. Device ID + FCM token generated silently on first launch. Citizen is registered in under 2 seconds.', tag: 'UX', color: '#3b82f6' },
            { icon: '🔋', title: 'OS-Level · ~2% Battery', body: 'Zone boundaries handed to Android/iOS hardware chip directly. App can be killed — geofencing still works. ~2% vs 40% for JS polling.', tag: 'TECH', color: '#22c55e' },
            { icon: '⏱️', title: 'Dwell Time Filter', body: 'User must stay inside zone for 5 minutes before any notification fires. Passers-by are completely ignored.', tag: 'SMART', color: '#ef4444' },
            { icon: '🔁', title: 'Smart Deduplication', body: 'Redis key per user+zone with 24hr TTL. No spam even if they re-enter 10 times. Auto-expires for next-day fresh alerts.', tag: 'REDIS', color: '#f97316' },
            { icon: '✅', title: 'Verified Data Only', body: 'Every notification links to verified MongoDB record: scheme name, budget, completion %, responsible leader.', tag: 'TRUST', color: '#a855f7' },
            { icon: '📶', title: 'Offline Resilient', body: 'Zones cached locally after first load. Geofencing works without internet. Backend ping retried on reconnect.', tag: 'ROBUST', color: '#3b82f6' },
          ].map((f, i) => (
            <div key={i} className="feat-card">
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{f.body}</div>
              <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, marginTop: 12, letterSpacing: .5, textTransform: 'uppercase', background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}33` }}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Integration table */}
      <section style={{ padding: '0 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 11, color: '#a855f7', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 24, height: 1, background: '#a855f7', display: 'inline-block' }}></span>Distribution Strategy
        </div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: -1, marginBottom: 16 }}>500M+ users.<br />Zero new downloads.</h2>
        <p style={{ color: '#64748b', fontSize: 16, maxWidth: 500, lineHeight: 1.7, marginBottom: 32 }}>Single REST endpoint — any existing govt app integrates in 20 lines of code.</p>
        <div className="reveal">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['App', 'Users', 'Integration', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #1a1a2e' }}>{h}</th>)}</tr></thead>
            <tbody>
              {[['🟢 Aarogya Setu', '240M+', 'REST API · 20 lines'],['🔵 UMANG', '38M+', 'REST API · 20 lines'],['🟠 DigiLocker', '150M+', 'REST API · 20 lines'],['🔴 mParivahan', '80M+', 'REST API · 20 lines']].map(([app, users, int]) => (
                <tr key={app} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                  <td style={{ padding: '16px 20px', fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 14 }}>{app}</td>
                  <td style={{ padding: '16px 20px', color: '#a855f7', fontWeight: 600, fontSize: 14 }}>{users}</td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: '#94a3b8' }}>{int}</td>
                  <td style={{ padding: '16px 20px' }}><span style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', color: '#22c55e', fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>READY</span></td>
                </tr>
              ))}
              <tr style={{ background: 'rgba(124,58,237,.08)', borderTop: '1px solid #7c3aed' }}>
                <td style={{ padding: '16px 20px', fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#a855f7' }}>Total Reachable</td>
                <td style={{ padding: '16px 20px', fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#a855f7' }}>500M+</td>
                <td style={{ padding: '16px 20px', fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#a855f7' }}>Single endpoint</td>
                <td style={{ padding: '16px 20px', fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#a855f7' }}>Zero new downloads</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Tech stack */}
      <section style={{ padding: '0 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 11, color: '#a855f7', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 24, height: 1, background: '#a855f7', display: 'inline-block' }}></span>Tech Stack
        </div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: -1, marginBottom: 40 }}>Built right.</h2>
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
          {[['📱','React Native + Expo','Cross-platform mobile'],['⚡','Node.js + Express','Backend API'],['🍃','MongoDB Atlas','GeoJSON + 2dsphere'],['🔴','Redis (Upstash)','Dedup + cache'],['🔥','Firebase FCM','Push notifications'],['🗺️','Leaflet.js','Admin map'],['🔌','Socket.io','Real-time feed'],['⚛️','React + Vite','Admin dashboard']].map(([icon, name, role]) => (
            <div key={name} className="tech-card">
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div><div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 13 }}>{name}</div><div style={{ fontSize: 11, color: '#64748b' }}>{role}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 40px', textAlign: 'center', borderTop: '1px solid #1a1a2e' }}>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 16 }}>See the admin panel live</h2>
        <p style={{ color: '#64748b', marginBottom: 32, fontSize: 15 }}>Manage zones, projects, and view live notification analytics</p>
        <button className="btn-primary" onClick={() => navigate('/admin/login')}>Open Admin Dashboard →</button>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0d0d1e', borderTop: '1px solid #1a1a2e', padding: 40, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Geo<span style={{ color: '#a855f7' }}>Sanket</span></div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Hyper-Local Civic Awareness Engine · India Innovates 2026 · MCD</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Team Hustlers', 'India Innovates 2026', 'Municipal Corporation of Delhi'].map(t => (
            <span key={t} style={{ fontSize: 11, color: '#64748b', border: '1px solid #1a1a2e', padding: '4px 12px', borderRadius: 20 }}>{t}</span>
          ))}
        </div>
      </footer>
    </div>
  )
}

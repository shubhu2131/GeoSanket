import { useEffect } from 'react'
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

  const s = {
    page: { background: '#f8f9fa', color: '#111', fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', overflowX: 'hidden' },
    nav: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 },
    logo: { fontWeight: 800, fontSize: 20, color: '#111', letterSpacing: -0.5 },
    logoSpan: { color: '#7c3aed' },
    btnPrimary: { background: '#7c3aed', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' },
    btnOutline: { background: '#fff', color: '#374151', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500, border: '1px solid #d1d5db', cursor: 'pointer' },
  }

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        .reveal{opacity:0;transform:translateY(20px);transition:opacity .5s,transform .5s}
        .reveal.visible{opacity:1;transform:translateY(0)}
        .card:hover{box-shadow:0 4px 24px rgba(0,0,0,.1);transform:translateY(-2px)}
        .card{transition:all .2s}
        .btn-cta:hover{background:#6d28d9}
        .btn-sec:hover{background:#f3f4f6}
      `}</style>

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.logo}>Geo<span style={s.logoSpan}>Sanket</span></div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn-sec" onClick={() => navigate('/login')} style={s.btnOutline}>Citizen Login</button>
          <button className="btn-cta" onClick={() => navigate('/admin/login')} style={{ ...s.btnPrimary, fontSize: 13 }}>Admin Panel</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: '#fff', padding: '80px 32px 72px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f3f0ff', color: '#7c3aed', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 24, animation: 'fadeUp .5s ease both' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
          India Innovates 2026 · MCD
        </div>
        <h1 style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 20, animation: 'fadeUp .5s .1s ease both', color: '#111' }}>
          Know what your<br />
          <span style={{ color: '#7c3aed' }}>government built</span><br />
          where you stand.
        </h1>
        <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7, animation: 'fadeUp .5s .2s ease both' }}>
          Walk near a hospital, bridge, or school — get an instant notification with verified government project data. Budget, leader, completion. Right on your phone.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp .5s .3s ease both' }}>
          <button className="btn-cta" onClick={() => navigate('/login')} style={{ ...s.btnPrimary, padding: '13px 32px', fontSize: 15 }}>
            Try it as Citizen →
          </button>
          <button className="btn-sec" onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })} style={{ ...s.btnOutline, padding: '13px 24px', fontSize: 15 }}>
            See how it works
          </button>
        </div>
      </section>

      {/* STATS */}
      <div className="reveal" style={{ background: '#7c3aed', padding: '28px 32px', display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap' }}>
        {[['500M+', 'Citizens reachable'], ['0', 'Steps required'], ['650ms', 'Entry to notification'], ['~2%', 'Battery impact']].map(([v, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{v}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '72px 32px', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>How it works</p>
        <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 48, color: '#111' }}>Four steps. Zero effort from citizens.</h2>
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 20 }}>
          {[
            { n: '01', icon: '📍', title: 'You enter a zone', body: 'Hardware GPS detects you crossing the boundary of a geo-fenced govt site.' },
            { n: '02', icon: '⚙️', title: 'We verify', body: '5-minute dwell check + 24hr dedup — passers-by never get spammed.' },
            { n: '03', icon: '🏛️', title: 'Data fetched', body: 'Project name, budget, completion %, responsible leader — from our verified database.' },
            { n: '04', icon: '🔔', title: "You're notified", body: 'Push notification on your lock screen. Tap to see full project details.' },
          ].map(step => (
            <div key={step.n} className="card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', marginBottom: 12, letterSpacing: 1 }}>{step.n}</div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{step.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 8 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{step.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: '#fff', padding: '72px 32px', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Features</p>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 48, color: '#111' }}>Built to respect your privacy and time.</h2>
          <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 16 }}>
            {[
              { icon: '📵', title: 'No sign-up required', body: 'Device ID generated silently. No forms, no passwords, no personal data collected.' },
              { icon: '🔋', title: '~2% battery drain', body: 'We use the hardware GPS chip directly. The app can be closed — geofencing still works.' },
              { icon: '⏱️', title: '5-min dwell filter', body: 'Just walking past? You won\'t get notified. We only alert people who actually stop.' },
              { icon: '🔁', title: 'No spam — ever', body: 'One notification per zone per 24 hours. Redis deduplication runs on every request.' },
              { icon: '✅', title: 'Verified data only', body: 'Every project has scheme name, budget, completion %, and responsible leader attached.' },
              { icon: '📶', title: 'Works without internet', body: 'Zones cached locally. Geofencing works offline. Notifications retry on reconnect.' },
            ].map(f => (
              <div key={f.title} className="card" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATION TABLE */}
      <section style={{ padding: '72px 32px', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Distribution strategy</p>
        <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 16, color: '#111' }}>500M+ users. Zero new downloads.</h2>
        <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32, lineHeight: 1.6 }}>We plug into existing government apps as a REST API. Any app integrates in 20 lines of code.</p>
        <div className="reveal" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['App', 'Users', 'Integration', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {[['🟢 Aarogya Setu', '240M+', 'REST API · 20 lines'], ['🔵 UMANG', '38M+', 'REST API · 20 lines'], ['🟠 DigiLocker', '150M+', 'REST API · 20 lines'], ['🔴 mParivahan', '80M+', 'REST API · 20 lines']].map(([app, users, int]) => (
                <tr key={app} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: 14, color: '#111' }}>{app}</td>
                  <td style={{ padding: '14px 20px', color: '#7c3aed', fontWeight: 700, fontSize: 14 }}>{users}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280' }}>{int}</td>
                  <td style={{ padding: '14px 20px' }}><span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>Ready</span></td>
                </tr>
              ))}
              <tr style={{ background: '#f5f3ff', borderTop: '2px solid #7c3aed' }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#7c3aed', fontSize: 14 }}>Total</td>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#7c3aed', fontSize: 14 }}>500M+</td>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#7c3aed', fontSize: 13 }}>Single endpoint</td>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#7c3aed', fontSize: 13 }}>Zero new downloads</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#7c3aed', padding: '72px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: -0.5 }}>Try it right now</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.75)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>Login as a citizen and simulate entering a zone — see the full pipeline work in real time.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/login')} style={{ background: '#fff', color: '#7c3aed', padding: '13px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Citizen Login →
          </button>
          <button onClick={() => navigate('/admin/login')} style={{ background: 'rgba(255,255,255,.15)', color: '#fff', padding: '13px 28px', borderRadius: 8, fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,.3)', cursor: 'pointer' }}>
            Admin Panel
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#111', padding: '32px', textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 8 }}>
          Geo<span style={{ color: '#a855f7' }}>Sanket</span>
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Hyper-Local Civic Awareness Engine · India Innovates 2026 · MCD</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Team GeoSanket', 'India Innovates 2026', 'Municipal Corporation of Delhi'].map(t => (
            <span key={t} style={{ fontSize: 11, color: '#6b7280', border: '1px solid #374151', padding: '4px 12px', borderRadius: 20 }}>{t}</span>
          ))}
        </div>
      </footer>
    </div>
  )
}
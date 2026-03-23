import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'

export default function Landing() {
  const navigate = useNavigate()
  const { t } = useTheme()

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } })
    }, { threshold: 0.1 })
    reveals.forEach(r => io.observe(r))
    return () => io.disconnect()
  }, [])

  return (
    <div style={{ background: t.bg, color: t.text, fontFamily: t.font, overflowX: 'hidden', minHeight: '100vh', transition: 'background .3s, color .3s' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        .reveal{opacity:0;transform:translateY(20px);transition:opacity .6s,transform .6s}
        .reveal.visible{opacity:1;transform:translateY(0)}
        .hov-card:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(124,58,237,.15)}
        .hov-card{transition:all .25s}
      `}</style>

      {/* NAV */}
      <nav style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5, color: t.text }}>
          Geo<span style={{ color: t.purple }}>Sanket</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ThemeToggle style={{ color: t.muted, borderColor: t.border }} />
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: t.text, padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: `1px solid ${t.border}`, cursor: 'pointer', fontFamily: t.font }}>
            Citizen Login
          </button>
          <button onClick={() => navigate('/admin/login')} style={{ background: t.purple, color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: t.font }}>
            Admin Panel
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: t.surface, padding: '88px 32px 72px', textAlign: 'center', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: t.isDark ? 'rgba(124,58,237,.15)' : '#f3f0ff', color: t.purple, padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 28, border: `1px solid ${t.isDark ? 'rgba(124,58,237,.3)' : '#ddd6fe'}`, animation: 'fadeUp .5s ease both' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.purple, display: 'inline-block', animation: 'blink 2s infinite' }}></span>
          India Innovates 2026 · Municipal Corporation of Delhi
        </div>

        <h1 style={{ fontSize: 'clamp(36px,5.5vw,68px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, marginBottom: 24, animation: 'fadeUp .5s .1s ease both', color: t.text }}>
          Know what your<br />
          <span style={{ color: t.purple }}>government built</span><br />
          where you stand.
        </h1>

        <p style={{ fontSize: 17, color: t.muted, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7, animation: 'fadeUp .5s .2s ease both' }}>
          Walk near a hospital, bridge, or school and get an instant verified notification — project name, budget, leader, completion. All automatically.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp .5s .3s ease both' }}>
          <button onClick={() => navigate('/login')} style={{ background: t.purple, color: '#fff', padding: '14px 36px', borderRadius: 8, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: t.font }}>
            Try as Citizen →
          </button>
          <button onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', color: t.text, padding: '14px 28px', borderRadius: 8, fontSize: 15, fontWeight: 500, border: `1px solid ${t.border}`, cursor: 'pointer', fontFamily: t.font }}>
            See how it works
          </button>
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{ background: t.purple, padding: '28px 32px', display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap' }}>
        {[['500M+', 'Citizens reachable'], ['0', 'Steps required'], ['650ms', 'Entry to notification'], ['~2%', 'Battery impact']].map(([v, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', fontFamily: t.font }}>{v}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '80px 32px', maxWidth: 960, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: t.purple, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>How it works</p>
        <h2 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 48, color: t.text }}>Four steps. Zero effort.</h2>
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 }}>
          {[
            { n: '01', icon: '📍', title: 'You enter a zone', body: 'Hardware GPS chip detects you crossing into a geo-fenced government site.' },
            { n: '02', icon: '⚙️', title: 'We verify', body: '5-minute dwell check plus 24-hour dedup — passers-by never get notified.' },
            { n: '03', icon: '🏛️', title: 'Data is fetched', body: 'Project name, budget, completion percentage, responsible leader — verified.' },
            { n: '04', icon: '🔔', title: "You're notified", body: 'Push notification on your screen. Tap to see the full project details.' },
          ].map(step => (
            <div key={step.n} className="hov-card" style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.purple, marginBottom: 12, letterSpacing: 1 }}>{step.n}</div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{step.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 8 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.7 }}>{step.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: t.surface, padding: '80px 32px', borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: t.purple, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Features</p>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 48, color: t.text }}>Built to respect your privacy and time.</h2>
          <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
            {[
              { icon: '📵', title: 'No sign-up required', body: 'Device ID generated silently. No forms, no passwords, no personal data stored.' },
              { icon: '🔋', title: '~2% battery drain', body: 'We use the hardware GPS chip. The app can be fully closed — geofencing still works.' },
              { icon: '⏱️', title: '5-min dwell filter', body: 'Walking past quickly? You will not be notified. We only alert people who actually stop.' },
              { icon: '🔁', title: 'No spam — ever', body: 'One notification per zone per 24 hours. Redis deduplication runs on every single request.' },
              { icon: '✅', title: 'Verified data only', body: 'Every project has scheme name, budget, completion percentage, and responsible leader.' },
              { icon: '📶', title: 'Works offline', body: 'Zones cached locally. Geofencing works without internet. Retries when reconnected.' },
            ].map(f => (
              <div key={f.title} className="hov-card" style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 22 }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.7 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATION TABLE */}
      <section style={{ padding: '80px 32px', maxWidth: 960, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: t.purple, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Distribution Strategy</p>
        <h2 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 16, color: t.text }}>500M+ users. Zero new downloads.</h2>
        <p style={{ fontSize: 15, color: t.muted, marginBottom: 32, lineHeight: 1.6 }}>We plug into existing government apps as a single REST API endpoint. Any app can integrate in 20 lines of code.</p>
        <div className="reveal" style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font }}>
            <thead>
              <tr style={{ background: t.surface, borderBottom: `1px solid ${t.border}` }}>
                {['App', 'Users', 'Integration', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 600, color: t.muted, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['🟢 Aarogya Setu', '240M+', 'REST API · 20 lines'],
                ['🔵 UMANG', '38M+', 'REST API · 20 lines'],
                ['🟠 DigiLocker', '150M+', 'REST API · 20 lines'],
                ['🔴 mParivahan', '80M+', 'REST API · 20 lines']
              ].map(([app, users, int]) => (
                <tr key={app} style={{ borderBottom: `1px solid ${t.border}` }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: 14, color: t.text }}>{app}</td>
                  <td style={{ padding: '14px 20px', color: t.purple, fontWeight: 700, fontSize: 14 }}>{users}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: t.muted }}>{int}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ background: t.isDark ? 'rgba(34,197,94,.1)' : '#f0fdf4', color: t.green, border: `1px solid ${t.isDark ? 'rgba(34,197,94,.2)' : '#bbf7d0'}`, fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>Ready</span>
                  </td>
                </tr>
              ))}
              <tr style={{ background: t.isDark ? 'rgba(124,58,237,.08)' : '#f5f3ff', borderTop: `2px solid ${t.purple}` }}>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: t.purple, fontSize: 14 }}>Total</td>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: t.purple, fontSize: 14 }}>500M+</td>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: t.purple, fontSize: 13 }}>Single endpoint</td>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: t.purple, fontSize: 13 }}>Zero new downloads</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: t.purple, padding: '80px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: -0.5 }}>Try it right now</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.8)', marginBottom: 36, maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.6 }}>
          Login as a citizen, simulate entering a zone, and watch a real notification fire.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/login')} style={{ background: '#fff', color: t.purple, padding: '14px 36px', borderRadius: 8, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: t.font }}>
            Citizen Login →
          </button>
          <button onClick={() => navigate('/admin/login')} style={{ background: 'rgba(255,255,255,.15)', color: '#fff', padding: '14px 28px', borderRadius: 8, fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,.3)', cursor: 'pointer', fontFamily: t.font }}>
            Admin Panel
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: t.isDark ? '#000' : '#111', padding: '36px 32px', textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 8 }}>
          Geo<span style={{ color: '#a855f7' }}>Sanket</span>
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Hyper-Local Civic Awareness Engine · India Innovates 2026 · MCD</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Team GeoSanket', 'India Innovates 2026', 'Municipal Corporation of Delhi'].map(tag => (
            <span key={tag} style={{ fontSize: 11, color: '#6b7280', border: '1px solid #374151', padding: '4px 12px', borderRadius: 20 }}>{tag}</span>
          ))}
        </div>
      </footer>
    </div>
  )
}

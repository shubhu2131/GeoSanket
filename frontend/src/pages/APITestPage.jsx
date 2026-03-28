import { useState } from 'react'
import API from '../api'
import toast from 'react-hot-toast'

const LANGUAGES = ['en', 'hi', 'ta', 'te', 'kn', 'mr', 'bn', 'gu', 'pa']
const SAMPLE_APPS = ['aarogya_setu', 'umang', 'digilocker', 'mparivahan', 'custom']

const DELHI_ZONES = [
  { name: 'AIIMS Main Gate', lat: 28.5672, lng: 77.2090 },
  { name: 'Signature Bridge', lat: 28.7073, lng: 77.2263 },
  { name: 'DU North Campus Metro', lat: 28.6880, lng: 77.2073 },
]

export default function APITestPage() {
  const [lat, setLat] = useState('28.5672')
  const [lng, setLng] = useState('77.2090')
  const [deviceId, setDeviceId] = useState('test-device-' + Math.random().toString(36).slice(2, 8))
  const [appId, setAppId] = useState('aarogya_setu')
  const [lang, setLang] = useState('en')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('tester') // tester | docs | curl

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const runTest = async () => {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const { data } = await API.post('/api/v1/fence-check', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        deviceId,
        appId,
        lang,
      })
      setResult(data)
      if (data.shouldNotify) toast.success(`✅ ${data.count} notification(s) ready to deliver!`)
      else toast(`ℹ️ ${data.message || 'No notification triggered'}`, { icon: '📍' })
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      setError(msg)
      toast.error(`API Error: ${msg}`)
    } finally { setLoading(false) }
  }

  const curlCommand = `curl -X POST ${BASE_URL}/api/v1/fence-check \\
  -H "Content-Type: application/json" \\
  -d '{
    "lat": ${lat},
    "lng": ${lng},
    "deviceId": "${deviceId}",
    "appId": "${appId}",
    "lang": "${lang}"
  }'`

  const inp = { width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', color: '#111', fontSize: 13, outline: 'none', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' }
  const lbl = { fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'system-ui,-apple-system,Segoe UI,sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '20px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <a href="/" style={{ fontWeight: 800, fontSize: 18, color: '#111', textDecoration: 'none' }}>Geo<span style={{ color: '#7c3aed' }}>Sanket</span></a>
                <span style={{ background: '#f3f0ff', color: '#7c3aed', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, border: '1px solid #ddd6fe' }}>API</span>
                <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, border: '1px solid #bbf7d0' }}>● Live</span>
              </div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Integration API for Government Apps · <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '1px 6px', borderRadius: 4 }}>{BASE_URL}/api/v1/fence-check</span></div>
            </div>
            <a href="/citizen" style={{ background: '#7c3aed', color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>← Citizen View</a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>

        {/* What this is */}
        <div style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: 16, padding: '24px 28px', marginBottom: 28, color: '#fff' }}>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8, letterSpacing: -0.5 }}>Government App Integration API</div>
          <div style={{ fontSize: 14, opacity: .85, lineHeight: 1.7, maxWidth: 620 }}>
            Any existing government app (Aarogya Setu, UMANG, DigiLocker) calls this single endpoint with a user's coordinates. GeoSanket returns a ready-to-display notification payload with verified project data. The app handles the actual notification display — we handle the intelligence.
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
            {[['500M+', 'Reachable users'], ['1 endpoint', 'To integrate'], ['20 lines', 'Of code needed'], ['<650ms', 'Response time']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>{v}</div>
                <div style={{ fontSize: 11, opacity: .7, textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#fff', borderRadius: 10, padding: 4, marginBottom: 24, border: '1px solid #e5e7eb', width: 'fit-content' }}>
          {[['tester', '🧪 API Tester'], ['docs', '📄 Response Schema'], ['curl', '💻 cURL Command']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: activeTab === id ? '#7c3aed' : 'transparent', color: activeTab === id ? '#fff' : '#6b7280', fontSize: 13, fontWeight: activeTab === id ? 600 : 400, cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>

        {/* TAB: Tester */}
        {activeTab === 'tester' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <style>{`@media(max-width:640px){.api-grid{grid-template-columns:1fr!important}}`}</style>

            {/* Left — inputs */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 20 }}>Request Parameters</div>

              {/* Quick fill Delhi zones */}
              <div style={{ marginBottom: 18 }}>
                <label style={lbl}>Quick Fill — Delhi Demo Zones</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DELHI_ZONES.map(z => (
                    <button key={z.name} onClick={() => { setLat(z.lat.toString()); setLng(z.lng.toString()) }}
                      style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                      📍 {z.name}
                    </button>
                  ))}
                  <button onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(p => { setLat(p.coords.latitude.toFixed(6)); setLng(p.coords.longitude.toFixed(6)); toast.success('Using your real location!') })
                    }
                  }} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                    📡 My Location
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Latitude</label><input style={inp} value={lat} onChange={e => setLat(e.target.value)} placeholder="28.5672" /></div>
                <div><label style={lbl}>Longitude</label><input style={inp} value={lng} onChange={e => setLng(e.target.value)} placeholder="77.2090" /></div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Device ID <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(hashed in production)</span></label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inp, flex: 1 }} value={deviceId} onChange={e => setDeviceId(e.target.value)} />
                  <button onClick={() => setDeviceId('test-device-' + Math.random().toString(36).slice(2, 8))} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 12px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', color: '#374151' }}>New ID</button>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Change Device ID to bypass 24hr dedup during testing</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={lbl}>App ID</label>
                  <select style={inp} value={appId} onChange={e => setAppId(e.target.value)}>
                    {SAMPLE_APPS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Language</label>
                  <select style={inp} value={lang} onChange={e => setLang(e.target.value)}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={runTest} disabled={loading} style={{ width: '100%', background: loading ? '#6d28d9' : '#7c3aed', color: '#fff', padding: '13px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? '⏳ Calling API...' : '▶ Call Fence-Check API'}
              </button>

              {/* Request preview */}
              <div style={{ marginTop: 16, background: '#1e1e2e', borderRadius: 8, padding: 16, fontSize: 12, fontFamily: 'monospace', color: '#cdd6f4', lineHeight: 1.8, overflowX: 'auto' }}>
                <div style={{ color: '#6c7086', marginBottom: 4 }}>// Request being sent:</div>
                <div><span style={{ color: '#cba6f7' }}>POST</span> <span style={{ color: '#89b4fa' }}>/api/v1/fence-check</span></div>
                <div style={{ color: '#a6e3a1' }}>{'{'}</div>
                <div>&nbsp;&nbsp;<span style={{ color: '#89b4fa' }}>"lat"</span>: <span style={{ color: '#fab387' }}>{lat}</span>,</div>
                <div>&nbsp;&nbsp;<span style={{ color: '#89b4fa' }}>"lng"</span>: <span style={{ color: '#fab387' }}>{lng}</span>,</div>
                <div>&nbsp;&nbsp;<span style={{ color: '#89b4fa' }}>"deviceId"</span>: <span style={{ color: '#a6e3a1' }}>"{deviceId}"</span>,</div>
                <div>&nbsp;&nbsp;<span style={{ color: '#89b4fa' }}>"appId"</span>: <span style={{ color: '#a6e3a1' }}>"{appId}"</span>,</div>
                <div>&nbsp;&nbsp;<span style={{ color: '#89b4fa' }}>"lang"</span>: <span style={{ color: '#a6e3a1' }}>"{lang}"</span></div>
                <div style={{ color: '#a6e3a1' }}>{'}'}</div>
              </div>
            </div>

            {/* Right — response */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 20 }}>API Response</div>

              {!result && !error && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔌</div>
                  <div style={{ fontSize: 14 }}>Hit the API to see the response</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>Try the AIIMS quick fill → Call API</div>
                </div>
              )}

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>❌ Error</div>
                  <div style={{ fontSize: 13, color: '#dc2626', fontFamily: 'monospace' }}>{error}</div>
                </div>
              )}

              {result && (
                <div>
                  {/* Status banner */}
                  <div style={{ background: result.shouldNotify ? '#f0fdf4' : '#f9fafb', border: `1px solid ${result.shouldNotify ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{result.shouldNotify ? '✅' : 'ℹ️'}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: result.shouldNotify ? '#16a34a' : '#374151', fontSize: 15 }}>
                        {result.shouldNotify ? `${result.count} Notification${result.count > 1 ? 's' : ''} Ready` : 'No Notification'}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{result.message || (result.shouldNotify ? 'Govt app should display this to the citizen' : 'Dedup active or dwell not reached')}</div>
                    </div>
                  </div>

                  {/* Notification cards */}
                  {result.shouldNotify && result.notifications?.map((n, i) => (
                    <div key={i} style={{ background: '#fff', border: '2px solid #7c3aed', borderRadius: 12, padding: 18, marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Notification Payload #{i + 1}</div>

                      {/* Phone preview */}
                      <div style={{ background: '#1c1c1e', borderRadius: 12, padding: '12px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏛️</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: '#aeaeb2', lineHeight: 1.5 }}>{n.body}</div>
                          <div style={{ fontSize: 10, color: '#636366', marginTop: 4 }}>GeoSanket · now</div>
                        </div>
                      </div>

                      {/* Full data */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                        {[
                          ['Zone', n.zoneName],
                          ['Project', n.projectName],
                          ['Budget', n.budget?.sanctioned ? `₹${(n.budget.sanctioned/1e7).toFixed(0)} Cr` : '—'],
                          ['Completion', n.completionPercentage != null ? `${n.completionPercentage}%` : '—'],
                          ['Leader', n.leader?.name || '—'],
                          ['Scheme', n.scheme || '—'],
                          ['Department', n.department || '—'],
                          ['App ID', result.appId || appId],
                        ].map(([k, v]) => (
                          <div key={k} style={{ background: '#f9fafb', borderRadius: 6, padding: '8px 10px' }}>
                            <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 2 }}>{k}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{v || '—'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Raw JSON */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Raw JSON Response</div>
                    <div style={{ background: '#1e1e2e', borderRadius: 8, padding: 16, fontSize: 11, fontFamily: 'monospace', color: '#cdd6f4', lineHeight: 1.7, overflowX: 'auto', maxHeight: 300, overflowY: 'auto' }}>
                      <pre style={{ margin: 0 }}>{JSON.stringify(result, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Docs */}
        {activeTab === 'docs' && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#111', marginBottom: 20 }}>Response Schema</div>

            {/* Endpoint */}
            <div style={{ background: '#1e1e2e', borderRadius: 8, padding: 16, marginBottom: 24, fontFamily: 'monospace', fontSize: 13 }}>
              <span style={{ color: '#cba6f7' }}>POST</span> <span style={{ color: '#89b4fa' }}>{BASE_URL}/api/v1/fence-check</span>
            </div>

            {/* Request */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 12 }}>Request Body</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Field', 'Type', 'Required', 'Description'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: '#6b7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {[
                    ['lat', 'number', '✅ Yes', 'Latitude of citizen current location'],
                    ['lng', 'number', '✅ Yes', 'Longitude of citizen current location'],
                    ['deviceId', 'string', '✅ Yes', 'Unique device identifier (hash for privacy)'],
                    ['appId', 'string', '❌ No', 'Your app identifier (e.g. aarogya_setu)'],
                    ['lang', 'string', '❌ No', 'Language code: en, hi, ta, te, kn, mr (default: hi)'],
                  ].map(([f, t, r, d]) => (
                    <tr key={f} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 600, color: '#7c3aed', fontSize: 13 }}>{f}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#6b7280', fontSize: 12 }}>{t}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12 }}>{r}</td>
                      <td style={{ padding: '12px 14px', color: '#374151', fontSize: 13 }}>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Response */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 12 }}>Response Fields</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Field', 'Type', 'Description'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: '#6b7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {[
                    ['shouldNotify', 'boolean', 'true = show notification to citizen, false = do nothing'],
                    ['count', 'number', 'Number of notifications to show'],
                    ['notifications[].title', 'string', 'Notification title in requested language'],
                    ['notifications[].body', 'string', 'Notification body in requested language'],
                    ['notifications[].projectName', 'string', 'Full government project name'],
                    ['notifications[].zoneName', 'string', 'Geo-fence zone name'],
                    ['notifications[].budget.sanctioned', 'number', 'Sanctioned budget in rupees'],
                    ['notifications[].completionPercentage', 'number', 'Project completion (0-100)'],
                    ['notifications[].leader.name', 'string', 'Responsible leader name'],
                    ['notifications[].leader.designation', 'string', 'Leader designation'],
                    ['notifications[].scheme', 'string', 'Government scheme name'],
                    ['notifications[].department', 'string', 'Responsible department'],
                    ['notifications[].zoneId', 'string', 'Zone MongoDB ID'],
                    ['notifications[].projectId', 'string', 'Project MongoDB ID'],
                    ['message', 'string', 'Reason if shouldNotify is false'],
                  ].map(([f, t, d]) => (
                    <tr key={f} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#7c3aed', fontSize: 12 }}>{f}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#6b7280', fontSize: 11 }}>{t}</td>
                      <td style={{ padding: '10px 14px', color: '#374151', fontSize: 13 }}>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Integration code */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 12 }}>Integration Code (20 lines)</div>
              <div style={{ background: '#1e1e2e', borderRadius: 10, padding: 20, fontFamily: 'monospace', fontSize: 12, color: '#cdd6f4', lineHeight: 1.9, overflowX: 'auto' }}>
                <div style={{ color: '#6c7086' }}>// Call this whenever you get a location update</div>
                <div><span style={{ color: '#cba6f7' }}>async function</span> <span style={{ color: '#89b4fa' }}>checkGovtZones</span>(<span style={{ color: '#fab387' }}>lat, lng, deviceId</span>) {'{'}</div>
                <div>&nbsp;&nbsp;<span style={{ color: '#cba6f7' }}>const</span> res = <span style={{ color: '#cba6f7' }}>await</span> <span style={{ color: '#89b4fa' }}>fetch</span>(<span style={{ color: '#a6e3a1' }}>'{BASE_URL}/api/v1/fence-check'</span>, {'{'}</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;method: <span style={{ color: '#a6e3a1' }}>'POST'</span>,</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;headers: {'{'} <span style={{ color: '#a6e3a1' }}>'Content-Type'</span>: <span style={{ color: '#a6e3a1' }}>'application/json'</span> {'}'},</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;body: <span style={{ color: '#89b4fa' }}>JSON.stringify</span>({'{'}</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;lat, lng, deviceId,</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;appId: <span style={{ color: '#a6e3a1' }}>'your_app_name'</span>,</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;lang: <span style={{ color: '#a6e3a1' }}>'hi'</span></div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;{'}'})</div>
                <div>&nbsp;&nbsp;{'}'});</div>
                <div>&nbsp;&nbsp;<span style={{ color: '#cba6f7' }}>const</span> data = <span style={{ color: '#cba6f7' }}>await</span> res.<span style={{ color: '#89b4fa' }}>json</span>();</div>
                <div>&nbsp;&nbsp;<span style={{ color: '#cba6f7' }}>if</span> (data.shouldNotify) {'{'}</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;data.notifications.<span style={{ color: '#89b4fa' }}>forEach</span>(n =&gt; {'{'}</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#6c7086' }}>// Use your app's existing notification system</span></div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#89b4fa' }}>showNotification</span>(n.title, n.body);</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;{'}'});</div>
                <div>&nbsp;&nbsp;{'}'}</div>
                <div>{'}'}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: cURL */}
        {activeTab === 'curl' && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#111', marginBottom: 8 }}>Test with cURL</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>Run these commands in your terminal to test the API directly. Change the coordinates to match your zone locations.</div>

            {[
              {
                title: '1. Test near AIIMS (should trigger after 2nd call)',
                cmd: `curl -X POST ${BASE_URL}/api/v1/fence-check \\
  -H "Content-Type: application/json" \\
  -d '{"lat":28.5672,"lng":77.2090,"deviceId":"test-001","appId":"aarogya_setu","lang":"en"}'`
              },
              {
                title: '2. Test near Signature Bridge',
                cmd: `curl -X POST ${BASE_URL}/api/v1/fence-check \\
  -H "Content-Type: application/json" \\
  -d '{"lat":28.7073,"lng":77.2263,"deviceId":"test-002","appId":"umang","lang":"hi"}'`
              },
              {
                title: '3. Test with your current location (edit lat/lng)',
                cmd: `curl -X POST ${BASE_URL}/api/v1/fence-check \\
  -H "Content-Type: application/json" \\
  -d '{"lat":${lat},"lng":${lng},"deviceId":"${deviceId}","appId":"${appId}","lang":"${lang}"}'`
              },
              {
                title: '4. Test health check',
                cmd: `curl ${BASE_URL}/`
              }
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{item.title}</div>
                <div style={{ position: 'relative' }}>
                  <div style={{ background: '#1e1e2e', borderRadius: 8, padding: 16, fontFamily: 'monospace', fontSize: 12, color: '#cdd6f4', lineHeight: 1.8, overflowX: 'auto' }}>
                    <pre style={{ margin: 0 }}>{item.cmd}</pre>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(item.cmd); toast.success('Copied!') }}
                    style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>
                    Copy
                  </button>
                </div>
              </div>
            ))}

            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ fontWeight: 600, color: '#92400e', fontSize: 13, marginBottom: 4 }}>⚠️ Dwell time note</div>
              <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>First call starts the dwell timer. Call the same endpoint again with the same deviceId and coordinates after the dwell time (15s or 300s) to trigger the notification. Change deviceId to bypass the 24hr dedup for fresh testing.</div>
            </div>
          </div>
        )}

        {/* Bottom — partner apps */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginTop: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 16 }}>Target Integration Partners</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
            {[
              { emoji: '🟢', name: 'Aarogya Setu', users: '240M+', color: '#16a34a' },
              { emoji: '🔵', name: 'UMANG', users: '38M+', color: '#2563eb' },
              { emoji: '🟠', name: 'DigiLocker', users: '150M+', color: '#ea580c' },
              { emoji: '🔴', name: 'mParivahan', users: '80M+', color: '#dc2626' },
            ].map(app => (
              <div key={app.name} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{app.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>{app.name}</div>
                  <div style={{ fontSize: 12, color: app.color, fontWeight: 700 }}>{app.users} users</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '12px 16px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, fontSize: 13, color: '#7c3aed', fontWeight: 500 }}>
            Total reach: <strong>500M+ citizens</strong> · Zero new downloads required · One API call integration
          </div>
        </div>
      </div>
    </div>
  )
}
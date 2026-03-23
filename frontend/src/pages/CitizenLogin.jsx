import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import API from '../api'
import { useAuth } from '../context/AuthContext'

export default function CitizenLogin() {
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    const p = phone.trim(); const pw = password.trim()
    if (!p || !pw) { toast.error('Fill in all fields'); return }
    setLoading(true)
    try {
      const { data } = await API.post('/api/auth/login', { phone: p, password: pw })
      loginUser(data.user, data.token)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/citizen')
    } catch (err) {
      if (err.response?.status === 401) toast.error('Wrong phone or password')
      else toast.error(err.response?.data?.error || 'Login failed')
      console.error('[CitizenLogin]', err)
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const p = phone.trim(); const pw = password.trim(); const n = name.trim()
    if (!p || !pw || !n) { toast.error('Fill in all fields'); return }
    if (p.length !== 10) { toast.error('Phone must be 10 digits'); return }
    if (pw.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data } = await API.post('/api/auth/register', { name: n, phone: p, password: pw, role: 'citizen' })
      loginUser(data.user, data.token)
      toast.success('Account created! Welcome.')
      navigate('/citizen')
    } catch (err) {
      if (err.response?.status === 400) toast.error('Phone number already registered')
      else toast.error(err.response?.data?.error || 'Registration failed')
      console.error('[CitizenRegister]', err)
    } finally { setLoading(false) }
  }

  const inp = { width: '100%', background: '#080812', border: '1px solid #1a1a2e', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }
  const lbl = { fontSize: 11, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }

  return (
    <div style={{ minHeight: '100vh', background: '#05050f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>
            Geo<span style={{ color: '#22c55e' }}>Sanket</span>
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Citizen Portal</div>
        </div>

        <div style={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 16, padding: 32 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: '#080812', borderRadius: 8, padding: 4, marginBottom: 24 }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '8px', borderRadius: 6, border: 'none',
                background: tab === t ? '#7c3aed' : 'transparent',
                color: tab === t ? '#fff' : '#64748b',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'DM Sans,sans-serif', textTransform: 'capitalize'
              }}>{t === 'login' ? 'Sign In' : 'Register'}</button>
            ))}
          </div>

          <form onSubmit={tab === 'login' ? handleLogin : handleRegister}>
            {tab === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Full Name</label>
                <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Ravi Kumar" />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Phone Number</label>
              <input type="tel" style={inp} value={phone}
                onChange={e => setPhone(e.target.value)}
                onBlur={e => setPhone(e.target.value.trim())}
                placeholder="9876543210" maxLength={10} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} style={{ ...inp, paddingRight: 48 }}
                  value={password} onChange={e => setPassword(e.target.value)}
                  onBlur={e => setPassword(e.target.value.trim())}
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16
                }}>{showPw ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', background: loading ? '#166534' : '#16a34a',
              color: '#fff', padding: '13px', borderRadius: 8, border: 'none',
              fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans,sans-serif'
            }}>
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          {tab === 'login' && (
            <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(34,197,94,.08)', borderRadius: 8, border: '1px solid rgba(34,197,94,.2)' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Demo citizen account</div>
              <div style={{ fontSize: 12, color: '#22c55e', cursor: 'pointer' }}
                onClick={() => { setPhone('9876543210'); setPassword('citizen123') }}>
                📋 Phone: 9876543210 · Password: citizen123 (click to fill)
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', justifyContent: 'center', gap: 20 }}>
          <a href="/" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>← Back to home</a>
          <a href="/admin/login" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Admin login →</a>
        </div>
      </div>
    </div>
  )
}
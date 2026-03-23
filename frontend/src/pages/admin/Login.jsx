import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../../api'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../../components/ThemeToggle'
import { useTheme } from '../../context/ThemeContext'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const { t } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ph = phone.trim()
    const pw = password.trim()
    if (!ph || !pw) { toast.error('Fill in all fields'); return }
    if (ph.length !== 10) { toast.error('Phone must be 10 digits'); return }
    setLoading(true)
    try {
      const { data } = await login(ph, pw)
      if (data.user.role !== 'admin') {
        toast.error('Admin access only')
        navigate('/login')
        return
      }
      loginUser(data.user, data.token)
      toast.success(`Welcome, ${data.user.name}!`)
      navigate('/admin/dashboard')
    } catch (err) {
      if (err.response?.status === 401) toast.error('Wrong phone or password')
      else if (err.response?.status === 404) toast.error('Account not found')
      else toast.error(err.response?.data?.error || `Login failed (${err.response?.status || 'network error'})`)
      console.error('[AdminLogin]', err)
    } finally { setLoading(false) }
  }

  const inp = {
    width: '100%', background: t.inputBg, border: `1px solid ${t.border}`,
    borderRadius: 8, padding: '12px 16px', color: t.text, fontSize: 14,
    outline: 'none', fontFamily: t.font, boxSizing: 'border-box', transition: 'border .2s'
  }
  const lbl = { fontSize: 11, color: t.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: t.font }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: t.font, transition: 'background .3s' }}>

      {/* Theme toggle top right */}
      <div style={{ position: 'fixed', top: 20, right: 20 }}>
        <ThemeToggle style={{ color: t.muted, borderColor: t.border }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontWeight: 800, fontSize: 30, marginBottom: 6, letterSpacing: -1, color: t.text }}>
            Geo<span style={{ color: t.purple }}>Sanket</span>
          </div>
          <div style={{ fontSize: 13, color: t.muted }}>Admin Dashboard</div>
        </div>

        {/* Card */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 32 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 24, color: t.text }}>Sign in to admin</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Phone Number</label>
              <input
                type="tel" value={phone} maxLength={10}
                onChange={e => setPhone(e.target.value)}
                onBlur={e => setPhone(e.target.value.trim())}
                placeholder="9999999999" style={inp}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={e => setPassword(e.target.value.trim())}
                  placeholder="••••••••"
                  style={{ ...inp, paddingRight: 48 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontSize: 16, padding: 4
                }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', background: loading ? '#5b21b6' : t.purple,
              color: '#fff', padding: '13px', borderRadius: 8, border: 'none',
              fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: t.font, transition: 'background .2s'
            }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          {/* Demo credentials — click to fill */}
          <div
            onClick={() => { setPhone('9999999999'); setPassword('admin123') }}
            style={{ marginTop: 20, padding: '14px 16px', background: t.isDark ? 'rgba(124,58,237,.08)' : '#f5f3ff', borderRadius: 10, border: `1px solid ${t.isDark ? 'rgba(124,58,237,.25)' : '#ddd6fe'}`, cursor: 'pointer', transition: 'opacity .2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>Demo credentials — click to fill</div>
            <div style={{ fontSize: 13, color: t.purple, fontWeight: 500 }}>📋 Phone: 9999999999 &nbsp;·&nbsp; Password: admin123</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', justifyContent: 'center', gap: 24 }}>
          <a href="/" style={{ fontSize: 13, color: t.muted, textDecoration: 'none' }}>← Home</a>
          <a href="/login" style={{ fontSize: 13, color: t.purple, textDecoration: 'none' }}>Citizen login →</a>
        </div>
      </div>
    </div>
  )
}

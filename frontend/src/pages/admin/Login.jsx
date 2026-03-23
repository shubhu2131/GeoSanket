import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../../api'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedPhone = phone.trim()
    const trimmedPassword = password.trim()

    if (!trimmedPhone || !trimmedPassword) {
      toast.error('Phone and password are required')
      return
    }
    if (trimmedPhone.length !== 10) {
      toast.error('Phone number must be 10 digits')
      return
    }

    setLoading(true)
    try {
      const { data } = await login(trimmedPhone, trimmedPassword)
      if (data.user.role !== 'admin') {
        toast.error('Admin access only — use citizen login instead')
        return
      }
      loginUser(data.user, data.token)
      toast.success(`Welcome, ${data.user.name}!`)
      navigate('/admin/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error
      if (err.response?.status === 401) toast.error('Wrong phone or password')
      else if (err.response?.status === 404) toast.error('Account not found')
      else toast.error(msg || `Login failed (${err.response?.status || 'network error'})`)
      console.error('[Login Error]', err)
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', background: '#080812',
    border: '1px solid #1a1a2e', borderRadius: 8,
    padding: '12px 16px', color: '#fff', fontSize: 14,
    outline: 'none', fontFamily: 'DM Sans,sans-serif',
    boxSizing: 'border-box'
  }
  const lbl = {
    fontSize: 11, color: '#64748b', display: 'block',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1
  }

  return (
    <div style={{ minHeight: '100vh', background: '#05050f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>
            Geo<span style={{ color: '#a855f7' }}>Sanket</span>
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Admin Dashboard</div>
        </div>

        {/* Card */}
        <div style={{ background: '#0d0d1e', border: '1px solid #1a1a2e', borderRadius: 16, padding: 32 }}>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Sign in</h2>
          <form onSubmit={handleSubmit}>

            {/* Phone */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Phone Number</label>
              <input
                type="tel" value={phone}
                onChange={e => setPhone(e.target.value)}
                onBlur={e => setPhone(e.target.value.trim())}
                placeholder="9999999999" maxLength={10}
                style={inp}
              />
            </div>

            {/* Password */}
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
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: '#64748b', cursor: 'pointer',
                    fontSize: 16, padding: 4, lineHeight: 1
                  }}
                  title={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', background: loading ? '#5b21b6' : '#7c3aed',
                color: '#fff', padding: '13px', borderRadius: 8,
                border: 'none', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'DM Sans,sans-serif', transition: 'background .2s'
              }}
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(124,58,237,.08)', borderRadius: 8, border: '1px solid rgba(124,58,237,.2)' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Demo credentials</div>
            <div style={{ fontSize: 12, color: '#a855f7', cursor: 'pointer' }}
              onClick={() => { setPhone('9999999999'); setPassword('admin123') }}>
              📋 Phone: 9999999999 · Password: admin123 (click to fill)
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', justifyContent: 'center', gap: 20 }}>
          <a href="/" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>← Back to home</a>
          <a href="/login" style={{ fontSize: 13, color: '#a855f7', textDecoration: 'none' }}>Citizen login →</a>
        </div>
      </div>
    </div>
  )
}
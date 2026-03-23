import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../../api'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await login(phone, password)
      if (data.user.role !== 'admin') { toast.error('Admin access only'); return }
      loginUser(data.user, data.token)
      toast.success('Welcome back!')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
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
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Phone Number</label>
              <input
                type="text" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="9999999999"
                style={{ width: '100%', background: '#080812', border: '1px solid #1a1a2e', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', background: '#080812', border: '1px solid #1a1a2e', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#7c3aed', color: '#fff', padding: '13px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', opacity: loading ? .7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>
          <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(124,58,237,.08)', borderRadius: 8, border: '1px solid rgba(124,58,237,.2)' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Demo credentials</div>
            <div style={{ fontSize: 12, color: '#a855f7' }}>Phone: 9999999999 · Password: admin123</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>← Back to home</a>
        </div>
      </div>
    </div>
  )
}

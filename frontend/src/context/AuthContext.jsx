import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('gs_token'))

  useEffect(() => {
    const stored = localStorage.getItem('gs_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const loginUser = (userData, tok) => {
    setUser(userData)
    setToken(tok)
    localStorage.setItem('gs_token', tok)
    localStorage.setItem('gs_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('gs_token')
    localStorage.removeItem('gs_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

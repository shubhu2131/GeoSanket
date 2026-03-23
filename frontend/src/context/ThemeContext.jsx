import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('gs_theme')
    return saved ? saved === 'dark' : true // default dark
  })

  useEffect(() => {
    localStorage.setItem('gs_theme', dark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggle = () => setDark(d => !d)

  const t = dark ? {
    bg: '#05050f', surface: '#0d0d1e', border: '#1a1a2e',
    text: '#ffffff', muted: '#64748b', cardBg: '#0f0f20',
    inputBg: '#080812', navBg: 'rgba(5,5,15,.95)',
    purple: '#7c3aed', purpleLight: '#a855f7',
    green: '#22c55e', blue: '#3b82f6', red: '#ef4444', orange: '#f97316',
    statsBar: '#7c3aed', statText: '#fff', statMuted: 'rgba(255,255,255,.7)',
    tableHead: '#0d0d1e', tableRow: 'rgba(255,255,255,.04)',
    font: "'DM Sans', system-ui, sans-serif",
    isDark: true
  } : {
    bg: '#f8f9fa', surface: '#ffffff', border: '#e5e7eb',
    text: '#111111', muted: '#6b7280', cardBg: '#ffffff',
    inputBg: '#f9fafb', navBg: 'rgba(255,255,255,.95)',
    purple: '#7c3aed', purpleLight: '#6d28d9',
    green: '#16a34a', blue: '#2563eb', red: '#dc2626', orange: '#ea580c',
    statsBar: '#7c3aed', statText: '#fff', statMuted: 'rgba(255,255,255,.75)',
    tableHead: '#f9fafb', tableRow: 'rgba(0,0,0,.02)',
    font: "'DM Sans', system-ui, sans-serif",
    isDark: false
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle, t }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

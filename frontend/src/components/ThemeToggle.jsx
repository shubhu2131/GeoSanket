import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ style = {} }) {
  const { dark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        background: 'transparent',
        border: '1px solid currentColor',
        borderRadius: 8,
        padding: '6px 12px',
        fontSize: 16,
        cursor: 'pointer',
        opacity: 0.7,
        transition: 'opacity .2s',
        lineHeight: 1,
        ...style
      }}
      onMouseEnter={e => e.target.style.opacity = 1}
      onMouseLeave={e => e.target.style.opacity = 0.7}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}

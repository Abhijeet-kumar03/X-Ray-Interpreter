import { Sun, Moon } from 'lucide-react'
import useTheme from '../../hooks/useTheme'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-medical-500 ${className}`}
      aria-label="Toggle Theme"
      id="theme-toggle"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

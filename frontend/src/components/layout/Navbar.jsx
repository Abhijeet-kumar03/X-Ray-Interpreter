import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Bell, ChevronRight, LogOut } from 'lucide-react'
import useAppStore from '../../store/appStore'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'

const BREADCRUMB_MAP = {
  '/dashboard': [{ label: 'Dashboard' }],
  '/history':   [{ label: 'History' }],
  '/analysis':  [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Analysis' }],
  '/report':    [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Report' }],
}

function getBreadcrumbs(pathname) {
  const base = '/' + pathname.split('/')[1]
  return BREADCRUMB_MAP[base] || [{ label: 'Home' }]
}

export default function Navbar() {
  const location = useLocation()
  const { toggleSidebar } = useAppStore()
  const { user, logout } = useAuth()
  const breadcrumbs = getBreadcrumbs(location.pathname)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Build initials
  const initials = user?.initials || user?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex items-center px-4 lg:px-6 gap-4 shrink-0 sticky top-0 z-20 transition-colors">
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 flex-1 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />}
            {crumb.to ? (
              <Link
                to={crumb.to}
                className="text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors truncate"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-250 truncate">{crumb.label}</span>
            )}
          </div>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {/* System status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-health-50 border border-health-100 dark:bg-health-950/20 dark:border-health-900/30">
          <div className="w-1.5 h-1.5 rounded-full bg-health-500 animate-pulse" />
          <span className="text-xs font-medium text-health-700 dark:text-health-400">System Online</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <button className="relative p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <Bell size={18} />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="navbar-avatar-button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-medical-500 to-medical-700 flex items-center justify-center text-white text-xs font-bold shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-medical-400 focus:ring-offset-2"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            {initials}
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-card-lg border border-slate-100 dark:border-slate-800 py-1.5 z-50 overflow-hidden"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                    {user?.name || 'Guest'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {user?.email}
                  </p>
                  {user?.role && (
                    <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full bg-medical-50 text-2xs text-medical-700 font-semibold border border-medical-100 dark:bg-medical-950/30 dark:text-medical-400 dark:border-medical-900/50 capitalize">
                      {user.role}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="py-1">
                  <button
                    id="navbar-signout-button"
                    onClick={() => { setDropdownOpen(false); logout() }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors font-medium text-left"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  History,
  Activity,
  ChevronRight,
  Zap,
  X,
  LogOut,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
import useAppStore from '../../store/appStore'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    description: 'Upload & analyze',
  },
  {
    label: 'History',
    to: '/history',
    icon: History,
    description: 'Your past analyses',
  },
]

export default function Sidebar() {
  const location = useLocation()
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  const { user, logout } = useAuth()

  const [profileOpen, setProfileOpen] = useState(false)

  // Build initials from user name — fallback to '?'
  const initials = user?.initials || user?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 z-40 flex flex-col shadow-card-md lg:translate-x-0 lg:static lg:shadow-none transition-colors"
      >
        {/* ── Logo ─────────────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 relative">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-medical-600 flex items-center justify-center shadow-sm group-hover:bg-medical-700 transition-colors">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">MedVision AI</span>
              <div className="flex items-center gap-1">
                <Zap size={10} className="text-medical-500" />
                <span className="text-2xs text-medical-600 dark:text-medical-400 font-semibold uppercase tracking-wide">Diagnostic Platform</span>
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Navigation ───────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-2xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider px-3 mb-3">
            Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group border',
                  isActive
                    ? 'bg-medical-50 dark:bg-medical-950/20 text-medical-700 dark:text-medical-450 border-medical-100 dark:border-medical-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/20 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
                )}
              >
                <item.icon
                  size={18}
                  className={clsx(
                    'shrink-0 transition-colors',
                    isActive ? 'text-medical-600 dark:text-medical-450' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  <p className={clsx('text-2xs truncate', isActive ? 'text-medical-500 dark:text-medical-500' : 'text-slate-400 dark:text-slate-500')}>
                    {item.description}
                  </p>
                </div>
                {isActive && <ChevronRight size={14} className="text-medical-400 dark:text-medical-550 shrink-0" />}
              </Link>
            )
          })}
        </nav>

        {/* ── User Profile ─────────────────────────────────────── */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 px-3 py-3">
          {/* Toggle button */}
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-medical-500 to-medical-700 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
              {initials}
            </div>

            {/* Name + email */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {user?.name || 'Guest'}
              </p>
              <p className="text-2xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {user?.email || ''}
              </p>
            </div>

            {/* Expand icon */}
            {profileOpen
              ? <ChevronUp size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
              : <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
            }
          </button>

          {/* Expanded profile menu */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-1 pb-1 space-y-0.5">
                  {/* Role badge */}
                  {user?.role && (
                    <div className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-medical-50 dark:bg-medical-950/30 border border-medical-100 dark:border-medical-900/50 text-2xs text-medical-700 dark:text-medical-400 font-semibold capitalize">
                        <User size={10} />
                        {user.role}
                      </span>
                    </div>
                  )}

                  {/* Specialty / institution */}
                  {(user?.specialty || user?.institution) && (
                    <div className="px-3 py-1">
                      {user.specialty && (
                        <p className="text-2xs text-slate-500 dark:text-slate-400 truncate">{user.specialty}</p>
                      )}
                      {user.institution && (
                        <p className="text-2xs text-slate-400 dark:text-slate-500 truncate">{user.institution}</p>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="mx-3 my-1 border-t border-slate-100 dark:border-slate-800/80" />

                  {/* Logout */}
                  <button
                    id="sidebar-logout-button"
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-sm font-medium group text-left"
                  >
                    <LogOut size={15} className="shrink-0 animate-pulse-slow" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  )
}

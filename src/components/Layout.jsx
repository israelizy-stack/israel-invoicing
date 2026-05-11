import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, Settings } from 'lucide-react'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/invoices/new', icon: FileText, label: 'New Invoice' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  return (
    <div className="flex h-full min-h-screen bg-[#0f0f0f]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[#1e1e1e] flex flex-col py-6">
        <div className="px-5 mb-8">
          <span className="mono text-amber-400 font-semibold text-sm tracking-widest uppercase">Invoice Pro</span>
        </div>
        <nav className="flex flex-col gap-0.5 px-2 flex-1">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-400 font-medium'
                    : 'text-zinc-500 hover:text-white hover:bg-[#1a1a1a]'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 pb-2">
          <p className="text-zinc-700 text-xs mono">v1.0.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/',          label: 'Dashboard',       icon: '📊' },
  { path: '/vanity',    label: 'Vanity Analysis',  icon: '⚠️' },
  { path: '/keywords',  label: 'Keywords',         icon: '🔑' },
  { path: '/customers', label: 'Customers',        icon: '👥' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-gray-900 text-gray-100 flex flex-col min-h-screen">
      <div className="px-6 py-6 border-b border-gray-700">
        <h1 className="text-sm font-bold uppercase tracking-widest text-purple-400">Campaign Intel</h1>
        <p className="text-xs text-gray-500 mt-1">Activation vs. Vanity</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">Week 1 — EDA Phase</p>
        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1.5">
          <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '25%' }} />
        </div>
      </div>
    </aside>
  )
}

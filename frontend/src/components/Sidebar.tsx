import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, LineChart, PieChart } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/predictions', label: 'Predictions', icon: <BrainCircuit size={20} /> },
    { to: '/insights', label: 'Model Insights', icon: <LineChart size={20} /> },
    { to: '/segments', label: 'Segments', icon: <PieChart size={20} /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold gradient-text">Activation Intel</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {link.icon}
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

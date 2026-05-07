import { NavLink } from 'react-router-dom';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/admin/cocina' },
  { icon: 'inventory_2', label: 'Inventario', to: '/admin/inventario' },
  { icon: 'restaurant', label: 'Kitchen', to: '/admin/cocina' },
  { icon: 'restaurant_menu', label: 'Menú', to: '/' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-neutral-900 border-r border-neutral-800 z-40">
      <div className="p-6 border-b border-neutral-800">
        <h1 className="text-lg font-bold text-orange-500">La Terraza del Mar</h1>
        <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Admin Portal</p>
      </div>
      <nav className="flex-1 px-4 space-y-1 pt-4">
        {navItems.map(({ icon, label, to }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-orange-500/10 text-orange-500 border-r-4 border-orange-500'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

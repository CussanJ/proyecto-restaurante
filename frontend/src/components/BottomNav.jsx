import { NavLink } from 'react-router-dom';

const clienteLinks = [
  { icon: 'home', label: 'Home', to: '/' },
  { icon: 'restaurant_menu', label: 'Menu', to: '/' },
  { icon: 'receipt_long', label: 'Pedidos', to: '/pedidos' },
  { icon: 'person', label: 'Profile', to: '/' },
];

const adminLinks = [
  { icon: 'dashboard', label: 'Dashboard', to: '/admin/cocina' },
  { icon: 'inventory_2', label: 'Inventario', to: '/admin/inventario' },
  { icon: 'receipt_long', label: 'Pedidos', to: '/carrito' },
  { icon: 'restaurant_menu', label: 'Menú', to: '/menu' },
];

export default function BottomNav({ admin = false }) {
  const links = admin ? adminLinks : clienteLinks;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 backdrop-blur-md bg-neutral-900/95 border-t border-neutral-800 shadow-[0_-4px_12px_rgba(0,0,0,0.5)] rounded-t-2xl pb-safe"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      {links.map(({ icon, label, to }) => (
        <NavLink
          key={label}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-all duration-300 ${
              isActive ? 'text-orange-500 scale-110' : 'text-neutral-500'
            }`
          }
        >
          <span className="material-symbols-outlined">{icon}</span>
          <span className="text-[10px] uppercase tracking-wider mt-1">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
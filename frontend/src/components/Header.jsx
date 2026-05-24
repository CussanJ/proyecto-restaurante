import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { items } = useCart();
  const { admin } = useAuth();
  const navigate = useNavigate();
  const totalItems = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <header className="bg-neutral-950 border-b border-neutral-800 shadow-sm flex justify-between items-center w-full px-6 py-4 sticky top-0 z-40">
      <span
        className="text-xl font-black text-orange-500 tracking-tight cursor-pointer"
        onClick={() => navigate('/')}
      >
        La Terraza del Mar
      </span>
      <div className="flex items-center gap-2">
        <button className="text-neutral-400 hover:bg-neutral-900 p-2 rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        {!admin && (
          <button
            className="relative text-neutral-400 hover:bg-neutral-900 p-2 rounded-full transition-colors"
            onClick={() => navigate('/carrito')}
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}

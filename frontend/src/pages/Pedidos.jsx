import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem('pedidos') || '[]');
    setPedidos(guardados);
  }, []);

  const colorEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'en_camino':
        return 'text-blue-400 bg-blue-500/10';
      case 'entregado':
        return 'text-green-400 bg-green-500/10';
      default:
        return 'text-neutral-400 bg-neutral-800';
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header />

      <main
        className="max-w-4xl mx-auto px-4 pt-6"
        style={{ paddingBottom: '120px' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-neutral-400 hover:text-white"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>
          </button>

          <div>
            <h1 className="text-2xl font-black">
              Mis pedidos
            </h1>

            <p className="text-sm text-neutral-500">
              Consulta el estado de tus órdenes
            </p>
          </div>
        </div>

        {pedidos.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-neutral-700">
              receipt_long
            </span>

            <p className="mt-4 text-neutral-500">
              Aún no tienes pedidos
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-surface-container border border-neutral-800 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-lg">
                      Pedido #{pedido.id.slice(-6)}
                    </p>

                    <p className="text-xs text-neutral-500">
                      {new Date(pedido.fecha).toLocaleString('es-MX')}
                    </p>
                  </div>

                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-green-400 bg-green-500/10"
                    >
                    Pagado
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  {pedido.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between text-sm text-neutral-300"
                    >
                      <span>
                        {item.nombre} ×{item.cantidad}
                      </span>

                      <span>
                        $
                        {(item.precio * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-neutral-500">
                      Dirección
                    </p>

                    <p className="text-sm">
                      {pedido.direccion}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-neutral-500">
                      Total
                    </p>

                    <p className="text-orange-500 font-black text-lg">
                      ${pedido.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/pedido/${pedido.id}`)}
                  className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors"
                >
                  Ver seguimiento
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
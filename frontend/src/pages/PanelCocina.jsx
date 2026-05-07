import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';

const mockPedidos = [
  {
    id: 1042,
    estado: 'pendiente',
    fecha: new Date().toISOString(),
    total: 45.50,
    items: [
      { _id: 'a1', nombre: 'Wagyu Truffle Burger', cantidad: 2, precio: 18.50 },
      { _id: 'a2', nombre: 'Rosemary Fries', cantidad: 1, precio: 8.50 },
    ],
  },
  {
    id: 1045,
    estado: 'en preparación',
    fecha: new Date().toISOString(),
    total: 22.00,
    items: [
      { _id: 'b1', nombre: 'Crispy Calamari', cantidad: 3, precio: 7.33 },
    ],
  },
  {
    id: 1048,
    estado: 'en preparación',
    fecha: new Date().toISOString(),
    total: 18.50,
    items: [
      { _id: 'c1', nombre: 'Pepperoni Pizza XL', cantidad: 1, precio: 14.00 },
      { _id: 'c2', nombre: 'Garlic Knots', cantidad: 1, precio: 4.50 },
    ],
  },
];

export default function PanelCocina() {
  const [pedidos, setPedidos] = useState([]);

  const cargarPedidos = () => {
    const guardados = JSON.parse(localStorage.getItem('pedidos') || '[]');
    const activos = guardados.filter(p => p.estado !== 'entregado');
    setPedidos(activos);
  };

  useEffect(() => {
    cargarPedidos();
    const intervalo = setInterval(cargarPedidos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const flujo = { pendiente: 'en preparación', 'en preparación': 'en camino', 'en camino': 'entregado' };

  const avanzarEstado = (pedidoId) => {
    const guardados = JSON.parse(localStorage.getItem('pedidos') || '[]');
    const actualizados = guardados.map(p => {
      if (p.id !== pedidoId) return p;
      return { ...p, estado: flujo[p.estado] || p.estado };
    });
    localStorage.setItem('pedidos', JSON.stringify(actualizados));
    cargarPedidos();
  };

  const activos = pedidos.length;
  const enPrep = pedidos.filter(p => p.estado === 'en preparación').length;
  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;

  return (
    <div className="flex min-h-screen bg-surface-dim text-on-background">
      <Sidebar />

      {/* Top bar */}
      <header className="fixed top-0 left-0 md:left-64 right-0 z-30 bg-neutral-950 border-b border-neutral-800 shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-headline-md text-on-surface">Live Kitchen Monitor</h2>
          <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">System Online</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-neutral-500">search</span>
            <input
              className="bg-neutral-900 border border-neutral-700 text-on-surface rounded-lg pl-10 pr-4 py-2 text-sm focus:border-orange-500 focus:outline-none w-56 transition-all"
              placeholder="Search orders..."
            />
          </div>
          <button className="text-neutral-400 hover:text-orange-500 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      <main className="pt-24 pb-20 md:pb-8 md:pl-64 min-h-screen w-full">
        <div className="px-6 max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Active Orders', value: activos, color: 'text-primary' },
              { label: 'In Preparation', value: enPrep, color: 'text-yellow-400' },
              { label: 'Ready to Serve', value: 0, color: 'text-tertiary' },
              { label: 'Pending', value: pendientes, color: 'text-red-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-surface-container border border-outline-variant p-4 rounded-xl">
                <p className="text-xs text-neutral-400 uppercase tracking-wide">{stat.label}</p>
                <p className={`text-4xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Grid de pedidos */}
          {pedidos.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <span className="material-symbols-outlined text-6xl text-neutral-600">restaurant</span>
              <p className="text-neutral-500 text-lg">No hay pedidos activos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pedidos.map(pedido => {
                const esCritico = pedido.estado === 'pendiente';
                return (
                  <div
                    key={pedido.id}
                    className={`bg-surface-container p-0 rounded-xl overflow-hidden flex flex-col shadow-lg ${
                      esCritico ? 'border-2 border-red-500' : 'border border-outline-variant'
                    }`}
                  >
                    {/* Header de la tarjeta */}
                    <div className={`px-4 py-3 flex justify-between items-center ${esCritico ? 'bg-red-500/10' : 'bg-neutral-800'}`}>
                      <span className={`text-lg font-bold ${esCritico ? 'text-red-400' : 'text-on-surface'}`}>
                        Order #{pedido.id}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-yellow-400">timer</span>
                        <span className={`text-sm font-bold uppercase px-2 py-0.5 rounded ${
                          esCritico ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {pedido.estado}
                        </span>
                      </div>
                    </div>

                    {/* Items del pedido */}
                    <div className="p-6 flex-1">
                      <ul className="space-y-4">
                        {pedido.items?.map(item => (
                          <li key={item._id} className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-lg text-on-surface">
                                {item.cantidad}x {item.nombre}
                              </p>
                            </div>
                            <span className="bg-neutral-800 text-neutral-400 px-2 py-1 rounded text-xs">
                              ${(item.precio * item.cantidad).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Botón de acción según estado */}
                    <div className="p-4 bg-surface-container-high">
                      {pedido.estado === 'pendiente' && (
                        <button
                          onClick={() => avanzarEstado(pedido.id)}
                          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-lg">restaurant</span>
                          Aceptar y preparar
                        </button>
                      )}
                      {pedido.estado === 'en preparación' && (
                        <button
                          onClick={() => avanzarEstado(pedido.id)}
                          className="w-full bg-primary-container hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-lg">delivery_dining</span>
                          Listo — Enviar repartidor
                        </button>
                      )}
                      {pedido.estado === 'en camino' && (
                        <button
                          onClick={() => avanzarEstado(pedido.id)}
                          className="w-full bg-tertiary hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                          Marcar como entregado
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav admin />

      {/* FAB */}
      <button className="fixed bottom-24 right-8 md:bottom-8 md:right-8 bg-primary-container text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </button>
    </div>
  );
}

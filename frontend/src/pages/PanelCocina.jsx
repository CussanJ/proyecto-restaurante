import { useEffect, useState } from 'react';
import { pedidosApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';

export default function PanelCocina() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarPedidos = async () => {
    try {
      const { data: pendientesData } = await pedidosApi.get('/pedidos?estado=pendiente');
      const { data: enPreparacionData } = await pedidosApi.get('/pedidos?estado=en preparaci�n');
      const pedidosActivos = [
        ...(pendientesData.pedidos || []),
        ...(enPreparacionData.pedidos || []),
      ];
      setPedidos(pedidosActivos);
      setError(null);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError('No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
    const intervalo = setInterval(cargarPedidos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const avanzarEstado = async (pedidoId) => {
    const pedido = pedidos.find((p) => p._id === pedidoId);
    if (!pedido) return;

    const siguienteEstado = pedido.estado === 'pendiente'
      ? 'en preparaci�n'
      : pedido.estado === 'en preparaci�n'
        ? 'en camino'
        : pedido.estado;

    if (siguienteEstado === pedido.estado) return;

    try {
      await pedidosApi.patch(`/pedidos/${pedidoId}`, { estado: siguienteEstado });
      cargarPedidos();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('Error al actualizar el estado del pedido.');
    }
  };

  const activos = pedidos.length;
  const enPrep = pedidos.filter((p) => p.estado === 'en preparaci�n').length;
  const pendientes = pedidos.filter((p) => p.estado === 'pendiente').length;

  return (
    <div className="flex min-h-screen bg-surface-dim text-on-background">
      <Sidebar />

      <main className="pt-24 pb-20 md:pb-8 md:pl-64 min-h-screen w-full">
        <div className="px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Active Orders', value: activos, color: 'text-primary' },
              { label: 'In Preparation', value: enPrep, color: 'text-yellow-400' },
              { label: 'Ready to Serve', value: 0, color: 'text-tertiary' },
              { label: 'Pending', value: pendientes, color: 'text-red-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-container border border-outline-variant p-4 rounded-xl">
                <p className="text-xs text-neutral-400 uppercase tracking-wide">{stat.label}</p>
                <p className={`text-4xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {cargando ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <span className="material-symbols-outlined text-6xl text-orange-500 animate-spin">sync</span>
              <p className="text-neutral-500 text-lg">Cargando pedidos...</p>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <span className="material-symbols-outlined text-6xl text-neutral-600">restaurant</span>
              <p className="text-neutral-500 text-lg">No hay pedidos activos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pedidos.map((pedido) => {
                const esCritico = pedido.estado === 'pendiente';
                return (
                  <div
                    key={pedido._id}
                    className={`bg-surface-container p-0 rounded-xl overflow-hidden flex flex-col shadow-lg ${
                      esCritico ? 'border-2 border-red-500' : 'border border-outline-variant'
                    }`}
                  >
                    <div className={`px-4 py-3 flex justify-between items-center ${esCritico ? 'bg-red-500/10' : 'bg-neutral-800'}`}>
                      <span className={`text-lg font-bold ${esCritico ? 'text-red-400' : 'text-on-surface'}`}>
                        Order #{pedido._id.slice(-6).toUpperCase()}
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
                    <div className="p-6 flex-1">
                      <ul className="space-y-4">
                        {pedido.items?.map((item) => (
                          <li key={item.productoId} className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-lg text-on-surface">{item.cantidad}x {item.nombre}</p>
                            </div>
                            <span className="bg-neutral-800 text-neutral-400 px-2 py-1 rounded text-xs">
                              ${(item.precio * item.cantidad).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-surface-container-high">
                      {pedido.estado === 'pendiente' && (
                        <button
                          type="button"
                          onClick={() => avanzarEstado(pedido._id)}
                          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-lg">restaurant</span>
                          Aceptar y preparar
                        </button>
                      )}
                      {pedido.estado === 'en preparaci�n' && (
                        <button
                          type="button"
                          onClick={() => avanzarEstado(pedido._id)}
                          className="w-full bg-primary-container hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-lg">delivery_dining</span>
                          Listo � Enviar repartidor
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

      <button className="fixed bottom-24 right-8 md:bottom-8 md:right-8 bg-primary-container text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </button>
    </div>
  );
}

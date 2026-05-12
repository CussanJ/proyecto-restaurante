import { useEffect, useState } from 'react';
import { pedidosApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import { pedidosApi } from '../services/api';

export default function PanelCocina() {
  const [pedidos, setPedidos] = useState([]);
  const [historial, setHistorial] = useState([]);

  const cargarPedidos = async () => {
    try {
      const { data } = await pedidosApi.get('/pedidos');

      setPedidos(
        data.filter(p => p.estado !== 'entregado')
      );

      setHistorial(
        data.filter(p => p.estado === 'entregado')
      );

    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  };

  useEffect(() => {
    cargarPedidos();
    const intervalo = setInterval(cargarPedidos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const flujo = {
    pendiente: 'en preparacion',
    'en preparacion': 'entregado'
  };

  const avanzarEstado = async (pedido) => {
    try {
      const nuevoEstado = flujo[pedido.estado];

      console.log('Actualizando pedido:', pedido._id);
      console.log('Nuevo estado:', nuevoEstado);

      await pedidosApi.patch(
        `/pedidos/${pedido._id}/estado`,
        {
          estado: nuevoEstado
        }
      );

      cargarPedidos();

    } catch (error) {
      console.error(
        'Error actualizando estado:',
        error.response?.data || error.message
      );
    }
  };

  const activos = pedidos.length;

  const enPrep = pedidos.filter(
    p => p.estado === 'en preparacion'
  ).length;

  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;

  const entregados = historial;

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
              {pedidos.map(pedido => {

                console.log(pedido.productos);

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
                        Order #{pedido._id.slice(-6)}
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

                        {pedido.detalle?.map(item => (
                          <li
                            key={item.productoId}
                            className="flex justify-between items-start"
                          >
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
                          onClick={() => avanzarEstado(pedido)}
                          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-lg">restaurant</span>
                          Aceptar y preparar
                        </button>
                      )}
                      {pedido.estado === 'en preparacion' && (
                        <button
                          onClick={() => avanzarEstado(pedido)}
                          className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-lg">
                            check_circle
                          </span>

                          Marcar entregado
                        </button>
                      )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Historial */}
                      <div className="mt-10">
                        <h3 className="text-xl font-bold mb-4">
                          Historial de pedidos
                        </h3>

                        <div className="space-y-3">
                          {entregados.map(pedido => (
                            <div
                              key={pedido._id}
                              className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex justify-between"
                            >
                              <span>Pedido #{pedido._id.slice(-6)}</span>

                              <span className="text-green-400 font-bold">
                                Entregado
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                </div>
              </main>

              <BottomNav admin />
            </div>
          );
}
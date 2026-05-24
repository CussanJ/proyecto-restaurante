import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import { pedidosApi } from '../services/api';

const FLUJO = {
  'pendiente':           { siguiente: 'preparando',          label: 'Comenzar preparación',     icon: 'restaurant',      clase: 'bg-blue-500 hover:bg-blue-400 text-white' },
  'preparando':          { siguiente: 'buscando repartidor', label: 'Listo, buscar repartidor', icon: 'delivery_dining', clase: 'bg-orange-500 hover:bg-orange-400 text-white' },
  'buscando repartidor': { siguiente: 'entregado',           label: 'Marcar entregado',         icon: 'home',            clase: 'bg-green-500 hover:bg-green-400 text-black' },
};

const BADGE = {
  'pendiente':           'bg-red-500/20 text-red-400 border border-red-500/30',
  'aceptado':            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  'preparando':          'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'buscando repartidor': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'entregado':           'bg-green-500/20 text-green-400 border border-green-500/30',
};

const LABEL = {
  'pendiente':           'Pendiente',
  'aceptado':            'Aceptado',
  'preparando':          'Preparando',
  'buscando repartidor': 'Buscando repartidor',
  'entregado':           'Entregado',
};

export default function PanelCocina() {
  const [pedidos, setPedidos]       = useState([]);
  const [historial, setHistorial]   = useState([]);
  const [pagina, setPagina]         = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const cargarActivos = async () => {
    try {
      const { data } = await pedidosApi.get(
        '/pedidos?estado=pendiente,aceptado,preparando,buscando%20repartidor&limit=100'
      );
      setPedidos(data.datos || data);
    } catch (err) {
      console.error('Error cargando pedidos activos:', err);
    }
  };

  const cargarHistorial = async (pag = 1) => {
    try {
      const { data } = await pedidosApi.get(`/pedidos?estado=entregado&page=${pag}&limit=5`);
      setHistorial(data.datos || []);
      if (data.totalPaginas) setTotalPaginas(data.totalPaginas);
    } catch (err) {
      console.error('Error cargando historial:', err);
    }
  };

  useEffect(() => {
    cargarActivos();
    cargarHistorial(1);
    const intervalo = setInterval(cargarActivos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => { cargarHistorial(pagina); }, [pagina]);

  const avanzarEstado = async (pedido) => {
    const accion = FLUJO[pedido.estado];
    if (!accion) return;
    try {
      await pedidosApi.patch(`/pedidos/${pedido._id}/estado`, { estado: accion.siguiente });
      cargarActivos();
      if (accion.siguiente === 'entregado') cargarHistorial(pagina);
    } catch (err) {
      console.error('Error actualizando estado:', err.response?.data || err.message);
    }
  };

  const pendientes          = pedidos.filter(p => p.estado === 'pendiente').length;
  const preparando          = pedidos.filter(p => p.estado === 'preparando').length;
  const buscandoRepartidor  = pedidos.filter(p => p.estado === 'buscando repartidor').length;

  return (
    <div className="flex min-h-screen bg-surface-dim text-on-background">
      <Sidebar />

      {/* Top bar */}
      <header className="fixed top-0 left-0 md:left-64 right-0 z-30 bg-neutral-950 border-b border-neutral-800 shadow-sm flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base md:text-headline-md text-on-surface font-bold">Live Kitchen</h2>
          <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2 md:px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">En línea</span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 md:pb-8 md:pl-64 min-h-screen w-full">
        <div className="px-6 max-w-7xl mx-auto">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Pedidos activos', value: pedidos.length,       color: 'text-primary-container' },
              { label: 'Preparando',      value: preparando,           color: 'text-blue-400' },
              { label: 'En reparto',      value: buscandoRepartidor,   color: 'text-orange-400' },
              { label: 'Pendientes',      value: pendientes,           color: 'text-red-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-surface-container border border-outline-variant p-4 rounded-xl">
                <p className="text-xs text-neutral-400 uppercase tracking-wide">{stat.label}</p>
                <p className={`text-4xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Pedidos activos */}
          {pedidos.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <span className="material-symbols-outlined text-6xl text-neutral-600">restaurant</span>
              <p className="text-neutral-500 text-lg">No hay pedidos activos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
              {pedidos.map(pedido => {
                const accion     = FLUJO[pedido.estado];
                const esPendiente = pedido.estado === 'pendiente';

                return (
                  <div
                    key={pedido._id}
                    className={`bg-surface-container rounded-xl overflow-hidden flex flex-col shadow-lg ${
                      esPendiente ? 'border-2 border-red-500' : 'border border-outline-variant'
                    }`}
                  >
                    {/* Header tarjeta */}
                    <div className={`px-4 py-3 flex justify-between items-center ${esPendiente ? 'bg-red-500/10' : 'bg-neutral-800'}`}>
                      <span className={`text-lg font-bold ${esPendiente ? 'text-red-400' : 'text-on-surface'}`}>
                        Pedido #{pedido._id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`text-[11px] font-bold uppercase px-2 py-1 rounded-full ${BADGE[pedido.estado] || ''}`}>
                        {LABEL[pedido.estado] || pedido.estado}
                      </span>
                    </div>

                    {/* Barra de progreso del pedido — 4 pasos */}
                    <div className="px-4 pt-4 pb-2">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute left-3 right-3 top-3 h-0.5 bg-neutral-700 z-0" />
                        {(() => {
                          const estados4 = ['pendiente', 'preparando', 'buscando repartidor', 'entregado'];
                          const iconos4  = ['receipt_long', 'restaurant', 'delivery_dining', 'home'];
                          const estadoNorm = pedido.estado === 'aceptado' ? 'preparando' : pedido.estado;
                          const idx = estados4.indexOf(estadoNorm);
                          return estados4.map((e, i) => {
                            const activo = i <= idx;
                            return (
                              <div key={e} className="flex flex-col items-center gap-1 z-10 flex-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                  activo ? 'bg-orange-500' : 'bg-neutral-700'
                                }`}>
                                  <span className="material-symbols-outlined text-[13px] text-white"
                                    style={{ fontVariationSettings: activo ? "'FILL' 1" : "'FILL' 0" }}>
                                    {iconos4[i]}
                                  </span>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Cliente */}
                    {pedido.cliente?.nombre && (
                      <div className="px-5 pt-1 text-sm text-neutral-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">person</span>
                        {pedido.cliente.nombre}
                      </div>
                    )}

                    {/* Items */}
                    <div className="p-5 flex-1">
                      <ul className="space-y-2">
                        {pedido.detalle?.map(item => (
                          <li key={item.productoId} className="flex justify-between items-center">
                            <span className="font-semibold text-on-surface">{item.cantidad}x {item.nombre}</span>
                            <span className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded text-xs">
                              ${(item.precio * item.cantidad).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 pt-3 border-t border-neutral-800 flex justify-between">
                        <span className="text-sm text-neutral-400">Total</span>
                        <span className="font-bold text-orange-500">${pedido.total?.toFixed(2)}</span>
                      </div>
                      {pedido.direccion && (
                        <div className="mt-2 flex items-start gap-1 text-xs text-neutral-500">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          <span>{pedido.direccion}</span>
                        </div>
                      )}
                    </div>

                    {/* Botón de acción */}
                    <div className="p-4 bg-surface-container-high">
                      {accion ? (
                        <button
                          onClick={() => avanzarEstado(pedido)}
                          className={`w-full font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95 ${accion.clase}`}
                        >
                          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {accion.icon}
                          </span>
                          {accion.label}
                        </button>
                      ) : (
                        <div className="text-center text-green-400 font-bold text-sm py-2 flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          Pedido entregado
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Historial */}
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4 text-on-surface">Historial de pedidos</h3>
            <div className="space-y-3">
              {historial.length === 0 ? (
                <p className="text-neutral-500 text-sm">No hay pedidos entregados aún.</p>
              ) : historial.map(pedido => (
                <div key={pedido._id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                    <div>
                      <span className="font-bold text-on-surface">Pedido #{pedido._id.slice(-6).toUpperCase()}</span>
                      <span className="text-xs text-neutral-500 ml-3">
                        {new Date(pedido.fecha || Date.now()).toLocaleString('es-MX')}
                      </span>
                    </div>
                    <span className="text-green-400 font-bold text-xs bg-green-400/10 px-2 py-1 rounded-full border border-green-500/20">
                      Entregado
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {pedido.detalle?.map(item => (
                      <li key={item.productoId} className="flex justify-between text-sm text-neutral-400">
                        <span>{item.cantidad}x {item.nombre}</span>
                        <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                    <span className="text-sm font-bold text-neutral-300">Total</span>
                    <span className="font-bold text-orange-500">${pedido.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="flex justify-between items-center mt-6 bg-neutral-900/50 px-4 py-3 rounded-lg border border-neutral-800">
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="text-orange-500 disabled:text-neutral-600 font-bold px-3 py-1 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back_ios</span> Anterior
                </button>
                <span className="text-neutral-400 text-sm font-semibold">Página {pagina} de {totalPaginas}</span>
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="text-orange-500 disabled:text-neutral-600 font-bold px-3 py-1 flex items-center gap-1 transition-colors"
                >
                  Siguiente <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      <BottomNav admin />
    </div>
  );
}

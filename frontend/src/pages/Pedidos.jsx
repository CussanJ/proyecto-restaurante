import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

// Función para mapear los estados del backend a estilos y textos visuales
function getEstadoBadge(estado) {
  const normalizado = estado?.toLowerCase() || 'pendiente';
  
  switch (normalizado) {
    case 'pendiente':
      return { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    case 'preparando':
      return { label: 'En Cocina', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    case 'enviado':
      return { label: 'En Reparto 🛵', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    case 'entregado':
      return { label: 'Entregado', color: 'text-green-400', bg: 'bg-green-500/10' };
    case 'cancelado':
      return { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500/10' };
    default:
      return { label: estado || 'Pagado', color: 'text-green-400', bg: 'bg-green-500/10' };
  }
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function verificarPedidos() {
      const guardados = JSON.parse(localStorage.getItem('pedidos') || '[]');
      
      if (guardados.length === 0) {
        setPedidos([]);
        setCargando(false);
        return;
      }

      const pedidosActualizados = [];

      for (const pedido of guardados) {
        try {
          // Consultamos directamente al microservicio de pedidos
          const response = await fetch(`http://localhost:3003/pedidos/${pedido.id}`);
          
          if (response.ok) {
            const dataBackend = await response.json();
            // Fusionamos los datos del localStorage con el estado en tiempo real del backend
            pedidosActualizados.push({
              ...pedido,
              estado: dataBackend.estado || pedido.estado || 'pendiente'
            });
          } else {
            // Si el servidor responde que ya no existe (un 404), no lo agregamos para limpiarlo
            console.warn(`El pedido ${pedido.id} no fue encontrado en el servidor.`);
          }
        } catch (error) {
          console.error(`Error verificando el pedido ${pedido.id}:`, error);
          // Si el servidor está offline, mantenemos lo que teníamos por si acaso
          pedidosActualizados.push(pedido);
        }
      }

      // Si hubo limpieza de pedidos eliminados, sincronizamos el LocalStorage
      if (pedidosActualizados.length !== guardados.length) {
        localStorage.setItem('pedidos', JSON.stringify(pedidosActualizados.map(p => ({ id: p.id, fecha: p.fecha, items: p.items, total: p.total, direccion: p.direccion, propina: p.propina }))));
      }

      setPedidos(pedidosActualizados);
      setCargando(false);
    }

    verificarPedidos();
  }, []);

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

        {cargando ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="animate-pulse">Verificando historial de pedidos...</p>
          </div>
        ) : pedidos.length === 0 ? (
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
            {pedidos.map((pedido) => {
              // Obtenemos los estilos dinámicos de la etiqueta para este pedido
              const badge = getEstadoBadge(pedido.estado);

              return (
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

                    {/* Badge dinámico */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.color}`}
                    >
                      {badge.label}
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

                  <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-neutral-500">
                        Dirección
                      </p>

                      <p className="text-sm">
                        {pedido.direccion}
                      </p>
                    </div>

                    <div className="text-right">
                      {(() => {
                        const subtotal = pedido.items.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
                        const propinaCalc = pedido.propina ?? (pedido.total > subtotal + 0.01 ? pedido.total - subtotal : 0);
                        const porcentajePropina = subtotal > 0 ? Math.round((propinaCalc / subtotal) * 100) : 0;
                        return (
                          <>
                            {propinaCalc > 0 && (
                              <p className="text-xs text-neutral-500 mb-1">
                                + ${propinaCalc.toFixed(2)} propina ({porcentajePropina}%)
                              </p>
                            )}
                            <p className="text-xs text-neutral-500">
                              Total
                            </p>
                            <p className="text-orange-500 font-black text-lg">
                              ${pedido.total.toFixed(2)}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/pedido/${pedido.id}`)}
                    className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    Ver seguimiento
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
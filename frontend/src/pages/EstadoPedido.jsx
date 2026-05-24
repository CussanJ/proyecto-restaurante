import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pedidosApi } from '../services/api';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const PASOS = [
  { icon: 'receipt_long',    label: 'Pedido\nrecibido',      estado: 'pendiente' },
  { icon: 'restaurant',      label: 'Preparando\npedido',    estado: 'preparando' },
  { icon: 'delivery_dining', label: 'Buscando\nrepartidor',  estado: 'buscando repartidor' },
  { icon: 'location_on',     label: 'Pedido\nentregado',     estado: 'entregado' },
];

const ESTADO_A_IDX = {
  'pendiente':           0,
  'aceptado':            1, // se trata igual que preparando
  'preparando':          1,
  'buscando repartidor': 2,
  'entregado':           3,
};

const TITULO = [
  'Pedido recibido',
  'Preparando tu pedido',
  'En camino a tu ubicación',
  '¡Pedido entregado!',
];

const MENSAJE = [
  'Tu pedido fue recibido. ¡El restaurante comenzará a prepararlo en breve!',
  'El chef está preparando tu pedido con mucho cuidado. ¡Ya casi está listo!',
  'Tu repartidor ya está en camino. ¡Pronto llegará a tu puerta!',
  '¡Tu pedido fue entregado! Esperamos que lo disfrutes. Buen provecho.',
];

export default function EstadoPedido() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [pedido, setPedido]           = useState(null);
  const [estadoIdx, setEstadoIdx]     = useState(0);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState(null);

  const cargarPedido = async () => {
    try {
      const { data } = await pedidosApi.get(`/pedidos/${id}`);
      setPedido(data);
      setEstadoIdx(ESTADO_A_IDX[data.estado] ?? 0);
      setError(null);
    } catch (err) {
      console.error('Error al cargar pedido:', err);
      setError('No se pudo cargar el pedido.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedido();
    const intervalo = setInterval(cargarPedido, 5000);
    return () => clearInterval(intervalo);
  }, [id]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-6xl text-orange-500 animate-spin">sync</span>
          <p className="text-on-surface-variant">Cargando tu pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-6xl text-red-400">error</span>
          <p className="text-on-surface-variant">{error || 'Pedido no encontrado'}</p>
          <button onClick={() => navigate('/')} className="bg-primary-container text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">home</span>
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  const entregado = estadoIdx === 3;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pb-32 pt-8 flex flex-col gap-6">

        {/* Título del estado actual */}
        <section className="bg-surface-container rounded-2xl p-6 border border-neutral-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-1">
                Pedido #{pedido._id?.slice(-6).toUpperCase()}
              </p>
              <h1 className="text-2xl font-bold text-on-surface">{TITULO[estadoIdx]}</h1>
            </div>
            {entregado ? (
              <span className="material-symbols-outlined text-5xl text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            ) : (
              <div className="flex flex-col items-center bg-orange-500/10 border border-orange-500/20 px-4 py-3 rounded-xl text-center flex-shrink-0">
                <span className="text-2xl font-bold text-orange-400">25–40</span>
                <span className="text-[10px] text-orange-500 uppercase tracking-wider font-bold">min</span>
              </div>
            )}
          </div>
        </section>

        {/* Barra de progreso estilo DiDi */}
        <section className="bg-surface-container rounded-2xl px-4 py-6 border border-neutral-800">

          {/* Línea + íconos */}
          <div className="relative flex justify-between items-start">

            {/* Línea de fondo */}
            <div className="absolute top-5 md:top-7 left-5 md:left-7 right-5 md:right-7 h-1 md:h-1.5 bg-neutral-700 rounded-full z-0" />

            {/* Línea naranja de progreso */}
            <div
              className="absolute top-5 md:top-7 left-5 md:left-7 h-1 md:h-1.5 bg-orange-500 rounded-full z-0 transition-all duration-700"
              style={{ width: estadoIdx === 0 ? '0%' : `calc(${(estadoIdx / (PASOS.length - 1)) * 100}% - 10px)` }}
            />

            {/* Pasos */}
            {PASOS.map((paso, i) => {
              const activo  = i <= estadoIdx;
              const current = i === estadoIdx;
              return (
                <div key={paso.estado} className="flex flex-col items-center gap-1.5 z-10" style={{ width: '20%' }}>

                  {/* Círculo con ícono */}
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                    activo
                      ? 'bg-orange-500 shadow-lg shadow-orange-500/40'
                      : 'bg-neutral-800 border-2 border-neutral-700'
                  } ${current && !entregado ? 'ring-4 ring-orange-500/30 scale-110' : ''}`}
                  >
                    <span
                      className="material-symbols-outlined text-[18px] md:text-[26px] text-white"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {paso.icon}
                    </span>
                  </div>

                  {/* Etiqueta */}
                  <span className={`text-[9px] md:text-[10px] font-bold text-center leading-tight whitespace-pre-line ${
                    current ? 'text-orange-400' : activo ? 'text-orange-300' : 'text-neutral-600'
                  }`}>
                    {paso.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mensaje del paso actual */}
          <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${entregado ? 'bg-green-400' : 'bg-orange-500 animate-pulse'}`} />
            <p className="text-sm text-on-surface">{MENSAJE[estadoIdx]}</p>
          </div>
        </section>

        {/* Mapa con moto animada */}
        <section className="bg-surface-container rounded-2xl border border-neutral-800 overflow-hidden">
          <div className="relative">
            <iframe
              title="La Terraza del Mar"
              src="https://maps.google.com/maps?q=Av+Juarez+100,Oaxaca+de+Juarez,Oaxaca,Mexico&output=embed&z=14"
              width="100%"
              height="260"
              style={{ border: 0, filter: 'grayscale(20%) contrast(1.05)', display: 'block' }}
              allowFullScreen
              loading="lazy"
            />

            {/* Pin del restaurante (fijo, lado izquierdo) */}
            <div className="absolute bottom-10 left-[18%] flex flex-col items-center pointer-events-none">
              <div className="text-2xl drop-shadow-lg">🏠</div>
            </div>

            {/* Moto del repartidor — se mueve según el estado */}
            {!entregado && (
              <div
                className="absolute bottom-12 pointer-events-none transition-all duration-[1800ms] ease-in-out"
                style={{
                  left: estadoIdx === 0 ? '22%'
                      : estadoIdx === 1 ? '30%'
                      : '62%',
                }}
              >
                <div className="flex flex-col items-center">
                  {/* Sombra de movimiento */}
                  <div className={`text-3xl drop-shadow-xl ${estadoIdx >= 2 ? 'animate-bounce' : 'animate-pulse'}`}>
                    🛵
                  </div>
                  {estadoIdx >= 2 && (
                    <span className="mt-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                      En camino
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Pin del destino (fijo, lado derecho) */}
            <div className="absolute bottom-10 right-[18%] flex flex-col items-center pointer-events-none">
              <div className="text-2xl drop-shadow-lg">📍</div>
            </div>

            {/* Overlay cuando está entregado */}
            {entregado && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                <div className="bg-green-500 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl text-sm">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  ¡Pedido entregado!
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Detalle del pedido */}
        <section className="bg-surface-container rounded-2xl border border-neutral-800 overflow-hidden">
          <div className="px-5 py-4 bg-surface-container-high border-b border-neutral-800 flex items-center gap-3">
            <span className="material-symbols-outlined text-orange-500">receipt_long</span>
            <div>
              <p className="font-bold text-sm text-on-surface">Detalle del pedido</p>
              <p className="text-xs text-neutral-500">La Terraza del Mar</p>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {pedido.detalle?.map(item => (
              <div key={item.productoId} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-neutral-600 text-sm">restaurant</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface text-sm">{item.nombre}</p>
                    <p className="text-xs text-neutral-500">x{item.cantidad}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-orange-500">${(item.precio * item.cantidad).toFixed(2)}</p>
              </div>
            ))}

            <div className="border-t border-neutral-800 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Subtotal</span>
                <span>${pedido.total?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Envío</span>
                <span className="text-green-400 font-semibold">Gratis</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-on-surface">Total</span>
                <span className="font-bold text-orange-500 text-lg">${pedido.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            {pedido.direccion && (
              <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800 mt-1">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1">Entrega en</p>
                <p className="text-sm text-on-surface">{pedido.direccion}</p>
                {pedido.referencia && <p className="text-xs text-neutral-400 mt-0.5">{pedido.referencia}</p>}
              </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => navigate('/')}
                className="w-full border border-neutral-700 text-on-surface font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
              >
                <span className="material-symbols-outlined">restaurant_menu</span>
                Hacer otro pedido
              </button>
            </div>
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  );
}

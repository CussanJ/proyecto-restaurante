import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const pasos = [
  { icon: 'receipt_long', label: 'Recibido' },
  { icon: 'restaurant', label: 'En preparación' },
  { icon: 'delivery_dining', label: 'En camino' },
  { icon: 'check_circle', label: 'Entregado' },
];

export default function EstadoPedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [estadoIdx, setEstadoIdx] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(null);

  const estadoAIdx = { pendiente: 0, 'en preparación': 1, 'en camino': 2, entregado: 3 };

  const leerEstado = () => {
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    const found = pedidos.find(p => p.id === Number(id));
    if (found) {
      setPedido(found);
      setEstadoIdx(estadoAIdx[found.estado] ?? 0);
      if (tiempoRestante === null) setTiempoRestante(found.tiempoEstimado || 30);
    }
  };

  useEffect(() => {
    leerEstado();
    const intervalo = setInterval(leerEstado, 3000);
    return () => clearInterval(intervalo);
  }, [id]);

  // Contador regresivo
  useEffect(() => {
    if (tiempoRestante === null || tiempoRestante <= 0) return;
    const interval = setInterval(() => {
      setTiempoRestante(t => (t > 0 ? t - 1 : 0));
    }, 60000);
    return () => clearInterval(interval);
  }, [tiempoRestante]);

  const mensajeEstado = [
    'Tu pedido fue recibido y está siendo procesado.',
    <>El chef está preparando tu pedido. <span className="font-bold text-primary-container">¡Ya casi listo!</span></>,
    <>Tu pedido está en camino. <span className="font-bold text-yellow-400">¡Pronto llegará!</span></>,
    <span className="font-bold text-tertiary">¡Tu pedido fue entregado! Buen provecho.</span>,
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header />

      <main className="max-w-7xl mx-auto px-6 pb-32 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Columna izquierda */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Hero: número de pedido + tiempo */}
          <section className="bg-surface-container rounded-xl p-6 border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-headline-md text-on-surface mb-1">Pedido #{id}</h1>
              <p className="text-body-md text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">schedule</span>
                Tiempo estimado de entrega: <span className="text-white font-semibold ml-1">25 – 40 min</span>
              </p>
              {pedido?.direccion && (
                <p className="text-body-md text-on-surface-variant flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-sm text-orange-500">location_on</span>
                  {pedido.direccion}{pedido.referencia ? ` — ${pedido.referencia}` : ''}
                </p>
              )}
            </div>
            <div className="bg-yellow-900/30 border border-yellow-600/50 px-5 py-3 rounded-xl text-center flex-shrink-0">
              <span className="text-4xl font-bold text-yellow-400 block leading-none">{tiempoRestante ?? '—'}</span>
              <span className="text-xs text-yellow-500 uppercase tracking-wider font-bold">min ETA</span>
            </div>
          </section>

          {/* Timeline de estado */}
          <section className="bg-surface-container rounded-xl p-6 border border-neutral-800">
            <div className="flex justify-between items-start relative">
              {/* Línea de fondo */}
              <div className="absolute top-6 left-[12%] right-[12%] h-1 bg-neutral-800 rounded-full">
                <div
                  className="h-full bg-primary-container rounded-full transition-all duration-1000"
                  style={{ width: `${(estadoIdx / (pasos.length - 1)) * 100}%` }}
                />
              </div>

              {pasos.map((paso, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    i <= estadoIdx
                      ? 'bg-primary-container text-white shadow-[0_0_15px_rgba(242,122,24,0.4)]'
                      : 'bg-surface-container-highest border-2 border-neutral-700 text-neutral-500'
                  } ${i === estadoIdx && estadoIdx < pasos.length - 1 ? 'animate-pulse' : ''}`}>
                    <span className="material-symbols-outlined" style={i <= estadoIdx ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {paso.icon}
                    </span>
                  </div>
                  <span className={`text-xs font-bold text-center leading-tight ${i <= estadoIdx ? 'text-primary-container' : 'text-neutral-500'}`}>
                    {paso.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_rgba(242,122,24,0.8)] flex-shrink-0" />
                <p className="text-body-md text-on-surface">{mensajeEstado[estadoIdx]}</p>
              </div>
            </div>
          </section>

          {/* Mapa: ubicación del restaurante */}
          <section className="bg-surface-container rounded-xl border border-neutral-800 overflow-hidden">
            <div className="px-4 py-3 bg-surface-container-high border-b border-neutral-800 flex items-center gap-3">
              <span className="material-symbols-outlined text-orange-500">restaurant</span>
              <div>
                <p className="font-bold text-sm text-on-surface">La Terraza del Mar</p>
                <p className="text-xs text-neutral-400">Av. Juárez 100, Centro, Oaxaca de Juárez, Oax.</p>
              </div>
              <div className="ml-auto flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-1 rounded-full text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                En línea
              </div>
            </div>
            <iframe
              title="La Terraza del Mar"
              src="https://maps.google.com/maps?q=Av+Juarez+100,Oaxaca+de+Juarez,Oaxaca,Mexico&output=embed&z=15"
              width="100%"
              height="280"
              style={{ border: 0, filter: 'grayscale(30%) contrast(1.1)' }}
              allowFullScreen
              loading="lazy"
            />
            <div className="px-4 py-3 bg-primary-container text-white text-sm font-bold text-center flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">delivery_dining</span>
              {estadoIdx < 2 ? 'El repartidor saldrá pronto' : estadoIdx === 2 ? 'Repartidor en camino a tu dirección' : '¡Pedido entregado!'}
            </div>
          </section>
        </div>

        {/* Columna derecha */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {pedido ? (
            <div className="bg-surface-container rounded-xl border border-neutral-800 overflow-hidden sticky top-24">
              <div className="p-5 bg-surface-container-high border-b border-neutral-800">
                <h2 className="text-headline-sm text-on-surface">Detalle del Pedido</h2>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">La Terraza del Mar — Cocina</p>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {pedido.items.map(item => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-neutral-600">restaurant</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-on-surface text-sm leading-tight">{item.nombre}</p>
                        <p className="text-sm text-neutral-400 ml-2">x{item.cantidad}</p>
                      </div>
                      <p className="text-xs font-bold text-primary-container mt-1">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="border-t border-neutral-800 pt-3 space-y-2">
                  <div className="flex justify-between text-sm text-neutral-400">
                    <span>Subtotal</span><span>${pedido.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-400">
                    <span>Envío</span><span className="text-tertiary">Gratis</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-on-surface">Total</span>
                    <span className="font-bold text-primary-container text-lg">${pedido.total.toFixed(2)}</span>
                  </div>
                </div>

                {pedido.direccion && (
                  <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1">Entrega en</p>
                    <p className="text-sm text-on-surface">{pedido.direccion}</p>
                    {pedido.referencia && <p className="text-xs text-neutral-400 mt-0.5">{pedido.referencia}</p>}
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-1">
                  <button className="w-full bg-primary-container text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">support_agent</span>
                    Contactar Soporte
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full border border-neutral-700 text-on-surface font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
                  >
                    <span className="material-symbols-outlined">restaurant_menu</span>
                    Nuevo Pedido
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container rounded-xl border border-neutral-800 p-8 text-center">
              <p className="text-neutral-500">Pedido no encontrado</p>
              <button onClick={() => navigate('/')} className="mt-4 text-orange-500 font-bold">Ir al menú</button>
            </div>
          )}

          {/* Promo */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-900 rounded-xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-headline-sm text-white">Comparte y Gana</h3>
              <p className="text-white/80 text-sm mt-1">Invita amigos a La Terraza del Mar y obtén $10 de descuento en tu próximo pedido.</p>
              <button className="mt-4 bg-white text-orange-700 font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors">
                Invitar Ahora
              </button>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-white/10 rotate-12">redeem</span>
          </div>
        </aside>
      </main>

      <BottomNav />
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { pedidosApi } from '../services/api';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const RESTAURANTE_LAT = 17.0655;
const RESTAURANTE_LON = -96.7236;

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const estimarTiempo = (distanciaKm) =>
  Math.min(60, Math.max(15, Math.round(10 + distanciaKm * 3)));

const formatCard = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export default function Carrito() {
  const { items, cambiarCantidad, eliminarItem, vaciarCarrito, total } = useCart();
  const navigate = useNavigate();

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [direccion, setDireccion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [mostrarConfirm, setMostrarConfirm] = useState(false);

  // Geolocalización
  const [ubicando, setUbicando] = useState(false);
  const [distancia, setDistancia] = useState(null);
  const [tiempoEstimado, setTiempoEstimado] = useState(null);
  const [geoError, setGeoError] = useState(null);

  // Pago
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [numTarjeta, setNumTarjeta] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [expiracion, setExpiracion] = useState('');
  const [cvv, setCvv] = useState('');

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.');
      return;
    }
    setUbicando(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = haversine(
          RESTAURANTE_LAT, RESTAURANTE_LON,
          pos.coords.latitude, pos.coords.longitude
        );
        setDistancia(dist.toFixed(1));
        setTiempoEstimado(estimarTiempo(dist));
        setUbicando(false);
      },
      () => {
        setGeoError('No se pudo obtener tu ubicación. Ingresa la dirección manualmente.');
        setUbicando(false);
      }
    );
  };

  const validarPago = () => {
    if (metodoPago === 'tarjeta') {
      if (numTarjeta.replace(/\s/g, '').length < 16) return 'Número de tarjeta incompleto.';
      if (!nombreTarjeta.trim()) return 'Ingresa el nombre del titular.';
      if (expiracion.length < 5) return 'Ingresa la fecha de vencimiento.';
      if (cvv.length < 3) return 'CVV inválido.';
    }
    return null;
  };

  const solicitarConfirmacion = () => {
    if (items.length === 0) return;
    if (!direccion.trim()) { setError('Por favor ingresa tu dirección de entrega.'); return; }
    const errPago = validarPago();
    if (errPago) { setError(errPago); return; }
    setError(null);
    setMostrarConfirm(true);
  };

  const confirmarPedido = async () => {
    setMostrarConfirm(false);
    setEnviando(true);
    setError(null);
    try {
      // Preparar items del carrito con información completa
      const itemsFormato = items.map(item => ({
        productoId: item._id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad
      }));

      // Enviar TODO el pedido en UN SOLO POST
      const respuesta = await pedidosApi.post('/pedidos', {
        items: itemsFormato,
        total,
        direccion: direccion.trim(),
        referencia: referencia.trim(),
        metodoPago,
        cliente: {
          nombre: nombreTarjeta || 'Cliente',
          email: '',
          telefono: ''
        }
      });

      // Obtener el ID del pedido creado
      const pedidoId = respuesta.data.pedido._id;

      // Guardar también en localStorage para compatibilidad
      const pedidosGuardados = JSON.parse(localStorage.getItem('pedidos') || '[]');
      const nuevoPedido = {
        id: pedidoId,
        items: [...items],
        total,
        estado: 'pendiente',
        fecha: new Date().toISOString(),
        direccion: direccion.trim(),
        referencia: referencia.trim(),
        tiempoEstimado: tiempoEstimado ?? Math.floor(Math.random() * 15) + 25,
        distanciaKm: distancia,
        metodoPago,
      };
      localStorage.setItem('pedidos', JSON.stringify([nuevoPedido, ...pedidosGuardados]));

      // Limpiar y redirigir
      vaciarCarrito();
      navigate('/pedido/' + pedidoId);
    } catch (err) {
      const mensajeError = err.response?.data?.error || err.response?.data?.mensaje || 'Error al crear el pedido';
      setError(mensajeError);
      console.error('Error detallado:', err.response?.data || err.message);
    } finally {
      setEnviando(false);
    }
  };

  const tipoTarjeta = () => {
    const n = numTarjeta.replace(/\s/g, '');
    if (n.startsWith('4')) return 'visa';
    if (n.startsWith('5')) return 'mastercard';
    if (n.startsWith('3')) return 'amex';
    return null;
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Header />

      <main className="max-w-5xl mx-auto px-6 pb-32 pt-8">
        <div className="mb-8">
          <h1 className="text-headline-lg text-on-surface mb-2">Finalizar Pedido</h1>
          <p className="text-on-surface-variant text-body-md">Revisa tu pedido, dirección y método de pago</p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <span className="material-symbols-outlined text-6xl text-neutral-600">shopping_cart</span>
            <p className="text-neutral-500 text-lg">Tu carrito está vacío</p>
            <button onClick={() => navigate('/')} className="bg-primary-container text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">restaurant_menu</span>
              Ver Menú
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Columna izquierda */}
            <div className="lg:col-span-2 space-y-5">

              {/* Items */}
              {items.map(item => (
                <div key={item._id} className="bg-surface-container border border-outline-variant rounded-xl p-4 flex gap-4 items-center">
                  <div className="w-20 h-20 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-3xl text-neutral-600">restaurant</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-headline-sm text-on-surface">{item.nombre}</h3>
                      <button onClick={() => eliminarItem(item._id)} className="text-neutral-600 hover:text-red-400 transition-colors ml-2">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                    <p className="text-neutral-500 text-xs mt-0.5">${item.precio} c/u</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold text-orange-500">${(item.precio * item.cantidad).toFixed(2)}</span>
                      <div className="flex items-center bg-surface-container-high rounded-full border border-outline-variant">
                        <button onClick={() => cambiarCantidad(item._id, -1)} className="p-1 hover:text-orange-500 transition-colors">
                          <span className="material-symbols-outlined text-lg">remove</span>
                        </button>
                        <span className="px-3 font-semibold text-sm">{String(item.cantidad).padStart(2, '0')}</span>
                        <button onClick={() => cambiarCantidad(item._id, 1)} className="p-1 hover:text-orange-500 transition-colors">
                          <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={() => navigate('/')} className="flex items-center gap-2 text-orange-500 font-semibold hover:underline">
                <span className="material-symbols-outlined">add_circle</span>
                Agregar más ítems
              </button>

              {/* Dirección */}
              <div className="bg-surface-container border border-outline-variant rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">location_on</span>
                  Dirección de entrega
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-400 uppercase tracking-wider font-bold block mb-1">Calle y número *</label>
                    <input
                      type="text"
                      placeholder="Ej: Calle Macedonio Alcalá 302"
                      value={direccion}
                      onChange={e => setDireccion(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-orange-500 transition-colors placeholder-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 uppercase tracking-wider font-bold block mb-1">Colonia / Referencia</label>
                    <input
                      type="text"
                      placeholder="Ej: Col. Centro, junto al mercado"
                      value={referencia}
                      onChange={e => setReferencia(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-orange-500 transition-colors placeholder-neutral-600"
                    />
                  </div>
                </div>

                {/* Botón geolocalización */}
                <button
                  onClick={obtenerUbicacion}
                  disabled={ubicando}
                  className="w-full flex items-center justify-center gap-2 border border-orange-500/40 text-orange-400 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">{ubicando ? 'sync' : 'my_location'}</span>
                  {ubicando ? 'Obteniendo ubicación...' : 'Usar mi ubicación GPS'}
                </button>

                {geoError && <p className="text-red-400 text-xs">{geoError}</p>}

                {distancia && tiempoEstimado && (
                  <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <span className="material-symbols-outlined text-tertiary">route</span>
                    <div>
                      <p className="text-xs text-neutral-400">Distancia al restaurante</p>
                      <p className="text-sm font-bold text-on-surface">
                        {distancia} km — <span className="text-tertiary">~{tiempoEstimado} min de entrega</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                  <span className="material-symbols-outlined text-orange-500 text-sm mt-0.5">info</span>
                  <p className="text-xs text-neutral-400">
                    Restaurante en <span className="text-white font-semibold">Oaxaca de Juárez, Oax.</span> — Solo entregas dentro de la ciudad.
                  </p>
                </div>
              </div>

              {/* Método de pago */}
              <div className="bg-surface-container border border-outline-variant rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">credit_card</span>
                  Método de pago
                </h3>

                {/* Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMetodoPago('tarjeta')}
                    className={`flex items-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-all ${
                      metodoPago === 'tarjeta'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-neutral-700 text-neutral-500 hover:border-neutral-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">credit_card</span>
                    Tarjeta
                  </button>
                  <button
                    onClick={() => setMetodoPago('efectivo')}
                    className={`flex items-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-all ${
                      metodoPago === 'efectivo'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-neutral-700 text-neutral-500 hover:border-neutral-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">payments</span>
                    Efectivo
                  </button>
                </div>

                {metodoPago === 'efectivo' && (
                  <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <span className="material-symbols-outlined text-yellow-400">info</span>
                    <p className="text-xs text-neutral-400">Paga al repartidor al recibir tu pedido. Ten el monto exacto.</p>
                  </div>
                )}

                {metodoPago === 'tarjeta' && (
                  <div className="space-y-3">
                    {/* Número de tarjeta */}
                    <div>
                      <label className="text-xs text-neutral-400 uppercase tracking-wider font-bold block mb-1">Número de tarjeta</label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="1234 5678 9012 3456"
                          value={numTarjeta}
                          onChange={e => setNumTarjeta(formatCard(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-orange-500 transition-colors placeholder-neutral-600 pr-16"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500 uppercase">
                          {tipoTarjeta() === 'visa' && <span className="text-blue-400">VISA</span>}
                          {tipoTarjeta() === 'mastercard' && <span className="text-red-400">MC</span>}
                          {tipoTarjeta() === 'amex' && <span className="text-green-400">AMEX</span>}
                        </div>
                      </div>
                    </div>

                    {/* Nombre */}
                    <div>
                      <label className="text-xs text-neutral-400 uppercase tracking-wider font-bold block mb-1">Nombre del titular</label>
                      <input
                        type="text"
                        placeholder="Como aparece en la tarjeta"
                        value={nombreTarjeta}
                        onChange={e => setNombreTarjeta(e.target.value.toUpperCase())}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-orange-500 transition-colors placeholder-neutral-600"
                      />
                    </div>

                    {/* Expiración + CVV */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-neutral-400 uppercase tracking-wider font-bold block mb-1">Vencimiento</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="MM/AA"
                          value={expiracion}
                          onChange={e => setExpiracion(formatExpiry(e.target.value))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-orange-500 transition-colors placeholder-neutral-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-400 uppercase tracking-wider font-bold block mb-1">CVV</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          placeholder="•••"
                          maxLength={4}
                          value={cvv}
                          onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-orange-500 transition-colors placeholder-neutral-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span className="material-symbols-outlined text-sm text-tertiary">lock</span>
                      Pago seguro — tus datos están protegidos
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resumen */}
            <div className="space-y-6">
              <div className="bg-surface-container-high border border-outline-variant rounded-2xl p-6 shadow-xl sticky top-24">
                <h2 className="text-headline-sm text-on-surface mb-6">Resumen del Pedido</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-on-surface-variant text-body-md">
                    <span>Subtotal</span><span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant text-body-md">
                    <span>Envío</span><span className="text-tertiary font-semibold">Gratis</span>
                  </div>
                  <div className="h-px bg-outline-variant" />
                  <div className="flex justify-between items-center">
                    <span className="text-headline-sm text-on-surface">Total</span>
                    <span className="text-headline-sm text-orange-500">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="bg-surface-container p-3 rounded-lg border border-outline-variant flex items-center gap-3">
                    <span className="material-symbols-outlined text-orange-500">location_on</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Entrega en</p>
                      <p className="text-xs font-medium text-on-surface truncate">
                        {direccion || <span className="text-neutral-600 italic">Sin dirección</span>}
                      </p>
                    </div>
                  </div>
                  <div className="bg-surface-container p-3 rounded-lg border border-outline-variant flex items-center gap-3">
                    <span className="material-symbols-outlined text-orange-500">schedule</span>
                    <div className="flex-1">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Tiempo estimado</p>
                      <p className="text-xs font-medium text-on-surface">
                        {tiempoEstimado ? `~${tiempoEstimado} min` : '25 – 40 minutos'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-surface-container p-3 rounded-lg border border-outline-variant flex items-center gap-3">
                    <span className="material-symbols-outlined text-orange-500">
                      {metodoPago === 'tarjeta' ? 'credit_card' : 'payments'}
                    </span>
                    <div className="flex-1">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Pago</p>
                      <p className="text-xs font-medium text-on-surface">
                        {metodoPago === 'tarjeta'
                          ? numTarjeta ? `**** **** **** ${numTarjeta.replace(/\s/g, '').slice(-4)}` : 'Tarjeta'
                          : 'Efectivo al entregar'}
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 bg-red-900/20 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  onClick={solicitarConfirmacion}
                  disabled={enviando}
                  className="w-full bg-primary-container text-white font-bold text-headline-sm py-4 rounded-xl shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {enviando ? 'Enviando pedido...' : 'Confirmar pedido'}
                </button>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl border border-dashed border-outline-variant flex gap-3 items-center">
                <span className="material-symbols-outlined text-tertiary">auto_awesome</span>
                <p className="text-body-md text-on-surface-variant">
                  Gana <span className="text-tertiary font-bold">150 puntos</span> con este pedido!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />

      {/* Modal de confirmación */}
      {mostrarConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
          <div className="bg-surface-container-high border border-outline-variant rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-500">receipt_long</span>
              </div>
              <h2 className="text-headline-sm text-on-surface">¿Confirmar pedido?</h2>
            </div>

            <div className="space-y-2 mb-5">
              {items.map(item => (
                <div key={item._id} className="flex justify-between text-sm text-on-surface-variant">
                  <span>{item.nombre} x{item.cantidad}</span>
                  <span className="text-on-surface font-semibold">${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
              <div className="h-px bg-outline-variant my-2" />
              <div className="flex justify-between font-bold text-on-surface">
                <span>Total</span>
                <span className="text-orange-500">${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-xs text-neutral-400">
                <span className="material-symbols-outlined text-sm text-orange-500">location_on</span>
                <span className="truncate">{direccion}</span>
              </div>
              {tiempoEstimado && (
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="material-symbols-outlined text-sm text-orange-500">schedule</span>
                  <span>Entrega estimada: ~{tiempoEstimado} min ({distancia} km)</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="material-symbols-outlined text-sm text-orange-500">
                  {metodoPago === 'tarjeta' ? 'credit_card' : 'payments'}
                </span>
                <span>{metodoPago === 'tarjeta' ? `Tarjeta *${numTarjeta.replace(/\s/g, '').slice(-4)}` : 'Efectivo al entregar'}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMostrarConfirm(false)}
                className="flex-1 border border-outline-variant text-on-surface-variant py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarPedido}
                className="flex-1 bg-primary-container text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
              >
                Sí, ordenar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

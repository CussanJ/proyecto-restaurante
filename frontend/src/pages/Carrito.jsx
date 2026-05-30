import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import cardValidator from 'card-validator';
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

const calcularRangoEntrega = (minutos) => {
  const ahora = new Date();
  const inicio = new Date(ahora.getTime() + minutos * 60000);
  const fin = new Date(ahora.getTime() + (minutos + 15) * 60000);
  const fmt = (d) => d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${fmt(inicio)} – ${fmt(fin)}`;
};

const formatCardNumber = (value) => {
  const clean = value.replace(/\D/g, '');
  const validation = cardValidator.number(clean);
  const card = validation.card;
  
  if (!card) {
    return clean.slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
  }
  
  const gaps = card.gaps || [4, 8, 12];
  const maxLength = Math.max(...card.lengths) || 16;
  const trimmed = clean.slice(0, maxLength);
  
  let formatted = '';
  let lastIndex = 0;
  for (const gap of gaps) {
    if (trimmed.length > gap) {
      formatted += trimmed.slice(lastIndex, gap) + ' ';
      lastIndex = gap;
    } else {
      break;
    }
  }
  formatted += trimmed.slice(lastIndex);
  return formatted;
};

const formatExpiry = (v) => {
  const clean = v.replace(/\D/g, '').slice(0, 4);
  if (clean.length > 2) {
    return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  }
  return clean;
};

const imagenPorNombre = (nombre) => {
  const n = nombre.toLowerCase();
  if (n.includes('truffle') || n.includes('smoky') || n.includes('garden') || n.includes('bacon') || n.includes('burger'))
    return 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80';
  if (n.includes('margherita') || n.includes('buffalo'))
    return 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80';
  if (n.includes('pepperoni'))
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80';
  if (n.includes('pizza'))
    return 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=400&q=80';
  if (n.includes('calamari'))
    return 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&q=80';
  if (n.includes('caesar') || n.includes('salad'))
    return 'https://images.unsplash.com/photo-1512852939750-1305098529bf?w=400&q=80';
  if (n.includes('rosemary') || n.includes('fries'))
    return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80';
  if (n.includes('botanical') || n.includes('soda'))
    return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80';
  if (n.includes('old fashioned') || n.includes('smoked'))
    return 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80';
  if (n.includes('garlic') || n.includes('knots'))
    return 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=400&q=80';
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';
};

export default function Carrito() {
  const { items, cambiarCantidad, eliminarItem, vaciarCarrito, total } = useCart();
  const navigate = useNavigate();

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [direccion, setDireccion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [imgError, setImgError] = useState({});

  // Geolocalización
  const [ubicando, setUbicando] = useState(false);
  const [distancia, setDistancia] = useState(null);
  const [tiempoEstimado, setTiempoEstimado] = useState(null);
  const [geoError, setGeoError] = useState(null);

  // Pago
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [numTarjeta, setNumTarjeta] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [expiracion, setExpiracion] = useState('');
  const [cvv, setCvv] = useState('');

  // Estados de toque y envío para validaciones en tiempo real
  const [numTarjetaTouched, setNumTarjetaTouched] = useState(false);
  const [nombreTarjetaTouched, setNombreTarjetaTouched] = useState(false);
  const [expiracionTouched, setExpiracionTouched] = useState(false);
  const [cvvTouched, setCvvTouched] = useState(false);
  const [direccionTouched, setDireccionTouched] = useState(false);
  const [referenciaTouched, setReferenciaTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Validaciones en tiempo real usando card-validator
  const cardValidation = cardValidator.number(numTarjeta);
  const expiryValidation = cardValidator.expirationDate(expiracion);
  const cvvValidation = cardValidator.cvv(cvv, cardValidation.card?.code?.size || 3);

  // Mensajes de error específicos en español
  const errors = {
    numTarjeta: !numTarjeta
      ? 'El número de tarjeta es requerido.'
      : !cardValidation.isValid
      ? 'Número de tarjeta inválido.'
      : null,
    nombreTarjeta: !nombreTarjeta.trim()
      ? 'El nombre del titular es requerido.'
      : nombreTarjeta.trim().length < 5
      ? 'El nombre debe tener al menos 5 caracteres.'
      : null,
    expiracion: !expiracion
      ? 'La fecha de vencimiento es requerida.'
      : !expiryValidation.isValid
      ? 'Fecha de vencimiento inválida (MM/AA).'
      : null,
    cvv: !cvv
      ? 'El CVV es requerido.'
      : !cvvValidation.isValid
      ? `El CVV debe ser de ${cardValidation.card?.code?.size || 3} dígitos.`
      : null
  };

  // Mensajes de error específicos para dirección
  const errorsDireccion = {
    direccion: !direccion.trim()
      ? 'La dirección (calle y número) es requerida.'
      : direccion.trim().length < 8
      ? 'La dirección debe tener al menos 8 caracteres.'
      : null,
    referencia: !referencia.trim()
      ? 'La colonia / referencia es requerida.'
      : referencia.trim().length < 5
      ? 'La colonia / referencia debe tener al menos 5 caracteres.'
      : null
  };

  const showCardNumberError = (numTarjetaTouched || submitted) && errors.numTarjeta;
  const showNombreError = (nombreTarjetaTouched || submitted) && errors.nombreTarjeta;
  const showExpiryError = (expiracionTouched || submitted) && errors.expiracion;
  const showCvvError = (cvvTouched || submitted) && errors.cvv;
  const showDireccionError = (direccionTouched || submitted) && errorsDireccion.direccion;
  const showReferenciaError = (referenciaTouched || submitted) && errorsDireccion.referencia;

  // Propina
  const [propinaPct, setPropinaPct] = useState(10);
  const [propinaCustom, setPropinaCustom] = useState('');
  const enviandoRef = useRef(false);

  // Pedido confirmado
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  const propinaAmount = propinaPct === 'otro'
    ? ((parseFloat(propinaCustom) || 0) / 100) * total
    : (propinaPct / 100) * total;
  const totalFinal = total + propinaAmount;
  const rangoEntrega = tiempoEstimado ? calcularRangoEntrega(tiempoEstimado) : null;

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) { setGeoError('Tu navegador no soporta geolocalización.'); return; }
    setUbicando(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const dist = haversine(RESTAURANTE_LAT, RESTAURANTE_LON, latitude, longitude);
        setDistancia(dist.toFixed(1));
        setTiempoEstimado(estimarTiempo(dist));
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data?.address) {
            const { road, pedestrian, house_number, suburb, neighbourhood, city, town, village, state } = data.address;
            const calle = road || pedestrian || '';
            const num = house_number ? ` ${house_number}` : '';
            setDireccion(`${calle}${num}`.trim() || data.display_name.split(',')[0]);
            setReferencia([suburb || neighbourhood, city || town || village, state].filter(Boolean).join(', '));
          }
        } catch { /* silencioso */ }
        setUbicando(false);
      },
      () => { setGeoError('No se pudo obtener tu ubicación. Verifica los permisos del navegador.'); setUbicando(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const validarPago = () => {
    if (metodoPago === 'tarjeta') {
      setSubmitted(true);
      if (errors.numTarjeta) return errors.numTarjeta;
      if (errors.nombreTarjeta) return errors.nombreTarjeta;
      if (errors.expiracion) return errors.expiracion;
      if (errors.cvv) return errors.cvv;
    }
    return null;
  };

  const solicitarConfirmacion = () => {
    if (items.length === 0) return;
    setSubmitted(true);
    if (errorsDireccion.direccion) { setError(errorsDireccion.direccion); return; }
    if (errorsDireccion.referencia) { setError(errorsDireccion.referencia); return; }
    const errPago = validarPago();
    if (errPago) { setError(errPago); return; }
    setError(null);
    setMostrarConfirm(true);
  };

  const confirmarPedido = async () => {
    if (enviandoRef.current) return;
    enviandoRef.current = true;

    setMostrarConfirm(false);
    setEnviando(true);
    setError(null);
    try {
      const itemsFormato = items.map(item => ({ productoId: item._id, cantidad: item.cantidad }));
      const respuesta = await pedidosApi.post('/pedidos', {
        cliente: { nombre: nombreTarjeta || 'Cliente', email: '', telefono: '' },
        items: itemsFormato,
        direccion: direccion.trim(),
        referencia: referencia.trim(),
        metodoPago,
        propina: propinaAmount
      });
      const pedidoId = respuesta.data.pedido._id;
      const pedidosGuardados = JSON.parse(localStorage.getItem('pedidos') || '[]');
      localStorage.setItem('pedidos', JSON.stringify([{
        id: pedidoId, items: [...items], total: totalFinal, estado: 'pendiente',
        fecha: new Date().toISOString(), direccion: direccion.trim(),
        referencia: referencia.trim(), tiempoEstimado: tiempoEstimado ?? 30,
        distanciaKm: distancia, metodoPago, propina: propinaAmount
      }, ...pedidosGuardados]));
      vaciarCarrito();
      setPedidoConfirmado(pedidoId);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.mensaje || 'Error al crear el pedido');
      enviandoRef.current = false;
    } finally {
      setEnviando(false);
    }
  };



  // ── Pantalla de éxito ──────────────────────────────────────────
  if (pedidoConfirmado) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center gap-6 px-6">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-green-400" style={{ fontSize: 52 }}>check_circle</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-on-surface mb-1">¡Pedido enviado!</h1>
          <p className="text-neutral-400 text-sm">Tu pedido ya fue enviado a cocina</p>
          {rangoEntrega && (
            <p className="text-orange-500 font-semibold mt-2 text-sm">
              Entrega estimada: {rangoEntrega}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate(`/pedido/${pedidoConfirmado}`)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined">receipt_long</span>
            Ver estado del pedido
          </button>
          <button
            onClick={() => navigate('/')}
            className="border border-neutral-700 text-neutral-300 px-6 py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors"
          >
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  // ── Vista principal ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header />

      <main className="max-w-5xl mx-auto px-4 pt-6" style={{ paddingBottom: 'max(128px, calc(80px + env(safe-area-inset-bottom)))' }}>

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-neutral-400 hover:text-white transition-colors p-1">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-black text-on-surface">Tu pedido</h1>
            <p className="text-neutral-500 text-xs">La Terraza del Mar</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <span className="material-symbols-outlined text-6xl text-neutral-700">shopping_cart</span>
            <p className="text-neutral-500 text-lg font-semibold">Tu carrito está vacío</p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors"
            >
              <span className="material-symbols-outlined">restaurant_menu</span>
              Ver Menú
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Columna principal ── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Items del carrito */}
              <div className="bg-surface-container border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                  <span className="font-bold text-sm text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500 text-base">store</span>
                    La Terraza del Mar
                  </span>
                  <span className="text-xs text-neutral-500">
                    {items.length} artículo{items.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {items.map((item, idx) => (
                  <div
                    key={item._id}
                    className={`flex gap-3 p-4 ${idx < items.length - 1 ? 'border-b border-neutral-800' : ''}`}
                  >
                    {/* Imagen */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-800">
                      {imgError[item._id] ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl text-neutral-600">restaurant</span>
                        </div>
                      ) : (
                        <img
                          src={item.imagen || imagenPorNombre(item.nombre)}
                          alt={item.nombre}
                          onError={() => setImgError(prev => ({ ...prev, [item._id]: true }))}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-semibold text-sm text-on-surface leading-tight">{item.nombre}</p>
                        <button
                          onClick={() => eliminarItem(item._id)}
                          className="text-neutral-600 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                      <p className="text-neutral-600 text-xs mt-0.5">${item.precio.toFixed(2)} c/u</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-orange-500 font-bold text-sm">
                          ${(item.precio * item.cantidad).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 bg-neutral-900 rounded-full border border-neutral-700">
                          <button
                            onClick={() => cambiarCantidad(item._id, -1)}
                            className="w-7 h-7 flex items-center justify-center hover:text-orange-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">remove</span>
                          </button>
                          <span className="text-sm font-bold w-5 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => cambiarCantidad(item._id, 1)}
                            className="w-7 h-7 flex items-center justify-center hover:text-orange-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="px-4 py-3 border-t border-neutral-800">
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1 text-orange-500 text-sm font-semibold hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Agregar más productos
                  </button>
                </div>
              </div>

              {/* Dirección */}
              <div className="bg-surface-container border border-neutral-800 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-on-surface flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-orange-500 text-base">location_on</span>
                  Dirección de entrega
                </h3>

                <div>
                  <input
                    type="text"
                    placeholder="Calle y número *"
                    value={direccion}
                    onBlur={() => setDireccionTouched(true)}
                    onChange={e => setDireccion(e.target.value)}
                    className={`w-full bg-neutral-900 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-neutral-600 ${
                      showDireccionError ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {showDireccionError && (
                    <p className="text-red-400 text-xs mt-1 pl-1">{showDireccionError}</p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Colonia / Referencia *"
                    value={referencia}
                    onBlur={() => setReferenciaTouched(true)}
                    onChange={e => setReferencia(e.target.value)}
                    className={`w-full bg-neutral-900 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-neutral-600 ${
                      showReferenciaError ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {showReferenciaError && (
                    <p className="text-red-400 text-xs mt-1 pl-1">{showReferenciaError}</p>
                  )}
                </div>

                <button
                  onClick={obtenerUbicacion}
                  disabled={ubicando}
                  className="w-full flex items-center justify-center gap-2 border border-orange-500/40 text-orange-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-lg ${ubicando ? 'animate-spin' : ''}`}>
                    {ubicando ? 'sync' : 'my_location'}
                  </span>
                  {ubicando ? 'Obteniendo ubicación...' : 'Usar mi ubicación GPS'}
                </button>

                {geoError && <p className="text-red-400 text-xs">{geoError}</p>}

                {rangoEntrega && (
                  <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <span className="material-symbols-outlined text-green-400 text-lg">schedule</span>
                    <div>
                      <p className="text-xs text-neutral-400">Hora de entrega estimada</p>
                      <p className="text-sm font-bold text-on-surface">{rangoEntrega}</p>
                      <p className="text-xs text-neutral-500">{distancia} km · ~{tiempoEstimado} min</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Método de pago */}
              <div className="bg-surface-container border border-neutral-800 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-on-surface flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-orange-500 text-base">credit_card</span>
                  Método de pago
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'efectivo', icon: 'payments', label: 'Efectivo' },
                    { id: 'tarjeta', icon: 'credit_card', label: 'Tarjeta' },
                  ].map(({ id, icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setMetodoPago(id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-all ${
                        metodoPago === id
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-neutral-700 text-neutral-500 hover:border-neutral-500'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>

                {metodoPago === 'efectivo' && (
                  <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                    <span className="material-symbols-outlined text-yellow-400 text-lg">info</span>
                    <p className="text-xs text-neutral-400">
                      Por favor confirma el método de pago seleccionado. Paga al repartidor al recibir tu pedido.
                    </p>
                  </div>
                )}

                {metodoPago === 'tarjeta' && (
                  <div className="space-y-3">
                    <div>
                      <div className="relative">
                        <input
                          type="text" inputMode="numeric" placeholder="1234 5678 9012 3456"
                          value={numTarjeta}
                          onBlur={() => setNumTarjetaTouched(true)}
                          onChange={e => setNumTarjeta(formatCardNumber(e.target.value))}
                          className={`w-full bg-neutral-900 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-neutral-600 pr-16 ${
                            showCardNumberError ? 'border-red-500' : 'border-neutral-700'
                          }`}
                        />
                        {cardValidation.card && (
                          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black ${
                            cardValidation.card.type === 'visa' ? 'text-blue-400' : cardValidation.card.type === 'mastercard' ? 'text-red-400' : cardValidation.card.type === 'american-express' ? 'text-green-400' : 'text-orange-400'
                          }`}>
                            {cardValidation.card.niceType}
                          </span>
                        )}
                      </div>
                      {showCardNumberError && (
                        <p className="text-red-400 text-xs mt-1 pl-1">{showCardNumberError}</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="text" placeholder="Nombre del titular"
                        value={nombreTarjeta}
                        onBlur={() => setNombreTarjetaTouched(true)}
                        onChange={e => setNombreTarjeta(e.target.value.toUpperCase())}
                        className={`w-full bg-neutral-900 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-neutral-600 ${
                          showNombreError ? 'border-red-500' : 'border-neutral-700'
                        }`}
                      />
                      {showNombreError && (
                        <p className="text-red-400 text-xs mt-1 pl-1">{showNombreError}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text" inputMode="numeric" placeholder="MM/AA"
                          value={expiracion}
                          onBlur={() => setExpiracionTouched(true)}
                          onChange={e => setExpiracion(formatExpiry(e.target.value))}
                          className={`w-full bg-neutral-900 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-neutral-600 ${
                            showExpiryError ? 'border-red-500' : 'border-neutral-700'
                          }`}
                        />
                        {showExpiryError && (
                          <p className="text-red-400 text-xs mt-1 pl-1">{showExpiryError}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="password" inputMode="numeric" placeholder="CVV"
                          maxLength={cardValidation.card?.code?.size || 3}
                          value={cvv}
                          onBlur={() => setCvvTouched(true)}
                          onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, cardValidation.card?.code?.size || 3))}
                          className={`w-full bg-neutral-900 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-neutral-600 ${
                            showCvvError ? 'border-red-500' : 'border-neutral-700'
                          }`}
                        />
                        {showCvvError && (
                          <p className="text-red-400 text-xs mt-1 pl-1">{showCvvError}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <span className="material-symbols-outlined text-sm text-green-500">lock</span>
                      Pago seguro — tus datos están protegidos
                    </div>
                  </div>
                )}
              </div>

              {/* Propina */}
              <div className="bg-surface-container border border-neutral-800 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-on-surface flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-orange-500 text-base">volunteer_activism</span>
                  Propina
                </h3>
                <p className="text-xs text-neutral-500">
                  Puedes agradecer al repartidor con una propina
                </p>

                <div className="flex gap-2 flex-wrap">
                  {[0, 5, 10, 15, 20].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setPropinaPct(pct)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        propinaPct === pct
                          ? 'bg-orange-500 text-white'
                          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                      }`}
                    >
                      {pct === 0 ? 'Sin propina' : `${pct}%`}
                    </button>
                  ))}
                  <button
                    onClick={() => setPropinaPct('otro')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      propinaPct === 'otro'
                        ? 'bg-orange-500 text-white'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    Otro
                  </button>
                </div>

                {propinaPct === 'otro' && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-bold">%</span>
                    <input
                      type="number" min="0" max="100" placeholder="0"
                      value={propinaCustom}
                      onChange={e => setPropinaCustom(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                )}

                {/* Desglose: subtotal + propina + total a pagar */}
                <div className="bg-neutral-950 rounded-xl border border-neutral-700 p-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>
                      Propina&nbsp;
                      <span className="text-orange-400 font-bold">
                        ({propinaPct === 'otro' ? `${propinaCustom || 0}%` : `${propinaPct}%`})
                      </span>
                    </span>
                    <span className={propinaAmount > 0 ? 'text-orange-400 font-semibold' : 'text-neutral-600'}>
                      {propinaAmount > 0 ? `+$${propinaAmount.toFixed(2)}` : '$0.00'}
                    </span>
                  </div>
                  <div className="h-px bg-neutral-700" />
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-on-surface">Total a pagar</span>
                    <span className="text-orange-500 text-base">${totalFinal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Resumen sticky ── */}
            <div>
              <div className="bg-surface-container-high border border-neutral-800 rounded-2xl p-5 sticky top-24 space-y-4">
                <h2 className="font-bold text-on-surface">Resumen</h2>

                {/* Lista compacta de items */}
                <div className="space-y-1.5">
                  {items.map(item => (
                    <div key={item._id} className="flex justify-between text-xs text-neutral-400">
                      <span className="truncate pr-2">{item.nombre} <span className="text-neutral-600">×{item.cantidad}</span></span>
                      <span className="flex-shrink-0">${(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-neutral-800" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Envío</span>
                    <span className="text-green-400 font-semibold">Gratis</span>
                  </div>
                  {propinaAmount > 0 && (
                    <div className="flex justify-between text-neutral-400">
                      <span>Propina</span>
                      <span>${propinaAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-neutral-800" />
                  <div className="flex justify-between font-bold text-on-surface text-base">
                    <span>Total</span>
                    <span className="text-orange-500">${totalFinal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Info entrega rápida */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="material-symbols-outlined text-sm text-orange-500">schedule</span>
                    <span>{rangoEntrega || '25 – 40 min'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="material-symbols-outlined text-sm text-orange-500">
                      {metodoPago === 'tarjeta' ? 'credit_card' : 'payments'}
                    </span>
                    <span>
                      {metodoPago === 'tarjeta'
                        ? numTarjeta ? `**** ${numTarjeta.replace(/\s/g,'').slice(-4)}` : 'Tarjeta'
                        : 'Pago en efectivo'}
                    </span>
                  </div>
                  {direccion && (
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span className="material-symbols-outlined text-sm text-orange-500">location_on</span>
                      <span className="truncate">{direccion}</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  onClick={solicitarConfirmacion}
                  disabled={enviando}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-base"
                >
                  {enviando ? 'Enviando...' : `Pagar $${totalFinal.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />

      {/* ── Modal "Realizando pedido" estilo Didi ── */}
      {mostrarConfirm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-t-3xl md:rounded-2xl w-full md:max-w-sm shadow-2xl">

            {/* Barra de agarre (mobile) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-neutral-700" />
            </div>

            <div className="p-6">
              <h2 className="text-xl font-black text-on-surface mb-5">Realizando pedido</h2>

              <div className="space-y-4">
                {/* Dirección */}
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-neutral-400 text-lg mt-0.5">location_on</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">{direccion}</p>
                    {referencia && <p className="text-xs text-neutral-500">{referencia}</p>}
                  </div>
                  <span className="material-symbols-outlined text-green-400">check</span>
                </div>

                {/* Instrucciones */}
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-neutral-400 text-lg">meeting_room</span>
                  <p className="flex-1 text-sm text-on-surface">Encontrarse en la puerta</p>
                  <span className="material-symbols-outlined text-green-400">check</span>
                </div>

                {/* Hora */}
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-neutral-400 text-lg mt-0.5">schedule</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">{rangoEntrega || '25 – 40 min'}</p>
                    <p className="text-xs text-neutral-500">Hora de entrega estimada</p>
                  </div>
                  <span className="material-symbols-outlined text-green-400">check</span>
                </div>

                {/* Pago */}
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-neutral-400 text-lg mt-0.5">
                    {metodoPago === 'tarjeta' ? 'credit_card' : 'payments'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">
                      {metodoPago === 'tarjeta' ? `Tarjeta **** ${numTarjeta.replace(/\s/g,'').slice(-4)}` : 'Pago en efectivo'}
                    </p>
                    <p className="text-xs text-orange-400">Por favor confirma el método de pago seleccionado</p>
                  </div>
                  <span className="material-symbols-outlined text-green-400">check</span>
                </div>

                {/* Items */}
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-neutral-400 text-lg mt-0.5">receipt_long</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface mb-1">Información del pedido</p>
                    {items.map(item => (
                      <p key={item._id} className="text-xs text-neutral-500">
                        x{item.cantidad} {item.nombre}
                      </p>
                    ))}
                  </div>
                  <span className="material-symbols-outlined text-green-400">check</span>
                </div>
              </div>

              {/* Totales */}
              <div className="mt-5 pt-4 border-t border-neutral-800 space-y-1">
                <div className="flex justify-between text-sm text-neutral-400">
                  <span>Tarifa artículos</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {propinaAmount > 0 && (
                  <div className="flex justify-between text-sm text-neutral-400">
                    <span>Propina</span>
                    <span>${propinaAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-on-surface text-base pt-1">
                  <span>Total</span>
                  <span className="text-orange-500">${totalFinal.toFixed(2)}</span>
                </div>
              </div>

              {/* Botones */}
              <button
                onClick={confirmarPedido}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-base transition-all active:scale-95 mt-5"
              >
                {enviando ? 'Procesando...' : 'Confirmar pedido'}
              </button>
              <button
                onClick={() => setMostrarConfirm(false)}
                className="w-full text-neutral-400 font-semibold py-3 mt-2 hover:text-white transition-colors text-sm"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

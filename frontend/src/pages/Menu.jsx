import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productosApi, inventarioApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import Sidebar from '../components/Sidebar';

const categorias = ['Todos', 'Burgers', 'Pizzas', 'Bebidas', 'Acompañados'];

const iconoCategoria = (cat) => {
  switch (cat) {
    case 'Burgers': return 'lunch_dining';
    case 'Pizzas': return 'local_pizza';
    case 'Bebidas': return 'local_bar';
    case 'Acompañados': return 'fastfood';
    default: return 'restaurant_menu';
  }
};

const imagenPorNombre = (nombre) => {
  const n = nombre.toLowerCase();
  if (n.includes('burger clásica') || n.includes('burger clasica'))
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80';
  if (n.includes('burger bbq'))
    return 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80';
  if (n.includes('burger doble'))
    return 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80';
  if (n.includes('burger'))
    return 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80';
  if (n.includes('margarita'))
    return 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80';
  if (n.includes('pepperoni'))
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80';
  if (n.includes('queso') || n.includes('4 quesos'))
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80';
  if (n.includes('pizza'))
    return 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=400&q=80';
  if (n.includes('coca') || n.includes('cola'))
    return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80';
  if (n.includes('limonada'))
    return 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80';
  if (n.includes('agua'))
    return 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80';
  if (n.includes('papas'))
    return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80';
  if (n.includes('aros'))
    return 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80';
  if (n.includes('nuggets') || n.includes('nugget'))
    return 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80';
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';
};

const iconoPorNombre = (nombre) => {
  const n = nombre.toLowerCase();
  if (n.includes('burger')) return 'lunch_dining';
  if (n.includes('pizza')) return 'local_pizza';
  if (n.includes('coca') || n.includes('limonada') || n.includes('agua')) return 'local_bar';
  if (n.includes('papas') || n.includes('aros') || n.includes('nuggets')) return 'fastfood';
  return 'restaurant';
};

export default function Menu() {
  const [productos, setProductos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [cargando, setCargando] = useState(true);
  const [imgError, setImgError] = useState({});
  const { agregarItem, items } = useCart();
  const { admin, cargando: authCargando } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const totalItems = items.reduce((s, i) => s + i.cantidad, 0);

  // "/" es siempre para el cliente. Si el admin llega aquí, lo mandamos a su panel.
  // "/menu" es la vista previa del menú para el admin (accesible desde el Sidebar).
  useEffect(() => {
    if (!authCargando && admin && location.pathname === '/') {
      navigate('/admin/cocina', { replace: true });
    }
  }, [admin, authCargando, location.pathname, navigate]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      productosApi.get('/productos'),
      inventarioApi.get('/inventario').catch(() => ({ data: [] }))
    ])
      .then(([resProd, resInv]) => {
        // Guardamos todo el catálogo. El filtrado lo haremos dinámicamente.
        setProductos(resProd.data);
        setInventario(resInv.data);
      })
      .catch(err => {
        console.error(err);
        setError('No se pudo cargar el menú');
      })
      .finally(() => setCargando(false));
  }, []);

  // Regla: El admin ve todo, el cliente solo ve los disponibles
  const productosVisibles = admin ? productos : productos.filter(p => p.disponible);

  const productosFiltrados = categoriaActiva === 'Todos'
    ? productosVisibles
    : productosVisibles.filter(p => p.categoria === categoriaActiva);

  const populares = productosVisibles.slice(0, 2);

  const handleImgError = (id) => {
    setImgError(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Sidebar para Administradores (Desktop) */}
      {admin && <Sidebar />}
      
      <div className={`flex-1 min-w-0 flex flex-col ${admin ? 'md:ml-64' : ''}`}>
        <Header />

        {/* Banner restaurante */}
        <div className="bg-gradient-to-r from-neutral-950 to-neutral-900 border-b border-neutral-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-orange-500 text-3xl">store</span>
            <div>
              <h2 className="font-bold text-white text-lg leading-tight">La Terraza del Mar</h2>
              <div className="flex items-center gap-1 text-neutral-400 text-xs">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span>Av. Juárez 100, Centro, Oaxaca de Juárez, Oax., México</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-orange-500">schedule</span>
              <span>Entrega: <span className="text-white font-semibold">25–40 min</span></span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-green-400">circle</span>
              <span className="text-green-400 font-semibold">Abierto ahora</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-yellow-400">star</span>
              <span>4.9</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-32 pt-6 md:pt-8" style={{ paddingBottom: 'max(128px, calc(80px + env(safe-area-inset-bottom)))' }}>

        {/* Categorías */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                categoriaActiva === cat
                  ? 'bg-primary-container text-white shadow-lg shadow-orange-500/20'
                  : 'bg-surface-container-high text-on-surface-variant border border-neutral-800 hover:bg-neutral-800'
              }`}
            >
              <span className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: categoriaActiva === cat ? "'FILL' 1" : "'FILL' 0" }}>
                {iconoCategoria(cat)}
              </span>
              {cat}
            </button>
          ))}
        </div>

        {/* Título */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl md:text-headline-lg text-on-surface font-bold">
              {categoriaActiva === 'Todos' ? 'Nuestro Menú' : categoriaActiva}
            </h1>
            <p className="text-neutral-400 text-body-md">
              {categoriaActiva === 'Todos'
                ? 'Preparado con ingredientes frescos de Oaxaca'
                : `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''} disponible${productosFiltrados.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Grid de productos */}
        {cargando ? (
          <div className="flex justify-center py-20">
            <span className="text-orange-500 text-lg animate-pulse">Cargando menú...</span>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <span className="material-symbols-outlined text-6xl text-neutral-600">
              {iconoCategoria(categoriaActiva)}
            </span>
            <p className="text-neutral-400 font-semibold">
              {categoriaActiva === 'Todos' ? 'No hay productos disponibles' : `No hay productos en ${categoriaActiva}`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {productosFiltrados.map(p => {
              const invItem = inventario.find(i => i.productoId === p._id);
              const agotado = invItem ? invItem.stock <= 0 : false;
              const inactivo = !p.disponible;

              return (
                <div
                  key={p._id}
                  className={`bg-surface-container rounded-xl overflow-hidden border border-neutral-800 transition-all group shadow-sm ${
                    (agotado || inactivo) ? 'opacity-60 grayscale' : 'hover:border-orange-500/50'
                  }`}
                >
                  {/* Imagen del producto */}
                  <div className="h-32 md:h-48 w-full bg-neutral-800 overflow-hidden relative">
                    {imgError[p._id] ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl md:text-7xl text-neutral-700">
                          {iconoPorNombre(p.nombre)}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={p.imagen || imagenPorNombre(p.nombre)}
                        alt={p.nombre}
                        onError={() => handleImgError(p._id)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-2 right-2 bg-neutral-900/80 backdrop-blur-md px-1.5 py-0.5 rounded-md text-orange-500 text-[10px] font-bold">
                      ★ 4.9
                    </div>
                    <div className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-md px-1.5 py-0.5 rounded-md text-neutral-300 text-[10px] font-semibold">
                      {p.categoria}
                    </div>
                  </div>

                  <div className="p-2.5 md:p-4">
                    <div className="flex justify-between items-start mb-1 gap-1">
                      <h3 className="text-xs md:text-headline-sm text-on-surface leading-tight font-bold line-clamp-2">{p.nombre}</h3>
                      <span className="text-primary-container font-bold text-sm md:text-lg flex-shrink-0">${p.precio}</span>
                    </div>
                    <p className="text-neutral-500 text-[10px] md:text-xs mb-2 line-clamp-2 hidden md:block">{p.descripcion}</p>
                    <p className={`text-[10px] md:text-xs font-semibold mb-2 md:mb-4 ${inactivo ? 'text-red-500' : agotado ? 'text-red-400' : 'text-tertiary'}`}>
                      {inactivo ? '● Oculto' : agotado ? '● Agotado' : '● Disponible'}
                    </p>
                    {admin ? (
                      <button
                        onClick={() => navigate('/admin/inventario')}
                        className="w-full bg-neutral-800 text-white py-2 md:py-3 rounded-lg font-bold flex items-center justify-center gap-1 md:gap-2 hover:bg-neutral-700 transition-colors text-xs md:text-sm"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        <span className="hidden sm:inline">Editar en Inventario</span>
                        <span className="sm:hidden">Editar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => !agotado && agregarItem(p)}
                        disabled={agotado}
                        className="w-full bg-primary-container text-white py-2 md:py-3 rounded-lg font-bold flex items-center justify-center gap-1 md:gap-2 active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-600 text-xs md:text-sm"
                      >
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {agotado ? 'remove_shopping_cart' : 'add_circle'}
                        </span>
                        <span className="hidden sm:inline">{agotado ? 'Agotado' : 'Agregar al pedido'}</span>
                        <span className="sm:hidden">{agotado ? 'Agotado' : 'Agregar'}</span>
                      </button>
                    )}
                  </div>
                </div>
            )})}
            </div>

            {/* Sección Popular ahora — solo visible en "Todos" */}
            {categoriaActiva === 'Todos' && populares.length > 0 && (
              <section className="mt-16">
                <h2 className="text-headline-md text-on-surface mb-6">Popular Ahora</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {populares.map((p, i) => {
                const invItem = inventario.find(inv => inv.productoId === p._id);
                const agotado = invItem ? invItem.stock <= 0 : false;
                const inactivo = !p.disponible;
                
                return (
                <div key={p._id} className={`bg-surface-container rounded-2xl border border-neutral-800 overflow-hidden flex flex-row items-stretch ${(agotado || inactivo) ? 'opacity-60 grayscale' : ''}`}>
                      <div className="w-32 flex-shrink-0 relative overflow-hidden">
                        {imgError[`pop-${p._id}`] ? (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                            <span className="material-symbols-outlined text-5xl text-neutral-600">{iconoPorNombre(p.nombre)}</span>
                          </div>
                        ) : (
                          <img
                            src={p.imagen || imagenPorNombre(p.nombre)}
                            alt={p.nombre}
                            onError={() => setImgError(prev => ({ ...prev, [`pop-${p._id}`]: true }))}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <span className={`text-xs font-bold ${i === 0 ? 'text-tertiary' : 'text-orange-500'}`}>
                            {i === 0 ? '🔥 Trending' : '⭐ Must Try'}
                          </span>
                          <h4 className="text-headline-sm mt-1">{p.nombre}</h4>
                          <p className="text-neutral-500 text-xs mt-1 line-clamp-2">{p.descripcion}</p>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-orange-500 font-bold text-lg">${p.precio}</span>
                          {admin ? (
                            <button
                              onClick={() => navigate('/admin/inventario')}
                              className="bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-neutral-700 transition-colors active:scale-95"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                              Editar
                            </button>
                          ) : (
                            <button
                              onClick={() => !agotado && agregarItem(p)}
                              disabled={agotado}
                              className="bg-primary-container text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-orange-600 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <span className="material-symbols-outlined text-sm">{agotado ? 'remove_shopping_cart' : 'add'}</span>
                              {agotado ? 'Agotado' : 'Agregar'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
              )})}
                </div>
              </section>
            )}

            {/* Ubicación del restaurante */}
            <section className="mt-16">
              <h2 className="text-headline-md text-on-surface mb-6">Nuestra Ubicación</h2>
              <div className="bg-surface-container rounded-2xl border border-neutral-800 overflow-hidden">
                <iframe
                  title="Ubicación La Terraza del Mar"
                  src="https://maps.google.com/maps?q=Av+Juarez+100,Oaxaca+de+Juarez,Oaxaca,Mexico&output=embed&z=15"
                  width="100%"
                  height="300"
                  style={{ border: 0, filter: 'grayscale(40%) contrast(1.1)' }}
                  allowFullScreen
                  loading="lazy"
                />
                <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-orange-500">location_on</span>
                    <div>
                      <p className="font-bold text-on-surface">La Terraza del Mar</p>
                      <p className="text-sm text-neutral-400">Av. Juárez 100, Centro, Oaxaca de Juárez, Oax., México</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-neutral-400">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>Lun–Dom: 12:00 – 23:00</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-orange-500">phone</span>
                      <span>(951) 123-4567</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Botón pedidos */}
      <button
        onClick={() => navigate('/pedidos')}
        className={`fixed right-6 md:right-10 z-40 bg-neutral-900 border border-neutral-700 text-white rounded-full p-4 shadow-xl hover:scale-105 transition-all ${
          totalItems > 0 ? 'bottom-44' : 'bottom-24'
        }`}
      >
        <span className="material-symbols-outlined">
          receipt_long
        </span>
      </button>

      {/* FAB carrito */}
      {totalItems > 0 && (
        <div className="fixed bottom-24 right-6 md:right-10 z-50">
          <button
            onClick={() => navigate('/carrito')}
            className="bg-primary-container text-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="relative">
              <span className="material-symbols-outlined text-3xl">
                shopping_cart
              </span>

              <span className="absolute -top-2 -right-2 bg-white text-orange-500 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </div>
          </button>
        </div>
      )}

        {/* BottomNav con opciones de Administrador (Mobile) */}
        <BottomNav admin={!!admin} />
      </div>
    </div>
  );
}
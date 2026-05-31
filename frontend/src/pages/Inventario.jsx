import { useEffect, useRef, useState } from 'react';
import { inventarioApi, productosApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';

const CATEGORIAS = ['General', 'Burgers', 'Pizzas', 'Bebidas', 'Acompañados'];

function getEstado(stock) {
  if (stock <= 2) return { label: 'Crítico', color: 'text-red-400', bg: 'bg-red-500/10' };
  if (stock <= 10) return { label: 'Bajo Inventario', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  return { label: 'Suficiente', color: 'text-green-400', bg: 'bg-green-500/10' };
}

const formVacio = {
  _id: null, nombre: '', precio: '', categoria: 'General',
  descripcion: '', imagen: '', disponible: true, stockInicial: 10,
};

export default function Inventario() {
  const [inventario, setInventario] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [tabImagen, setTabImagen] = useState('url');
  const [previewImagen, setPreviewImagen] = useState('');
  const [subiendoImg, setSubiendoImg] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  // Estados de toque y envío para validación de modal
  const [nombreTouched, setNombreTouched] = useState(false);
  const [precioTouched, setPrecioTouched] = useState(false);
  const [stockInicialTouched, setStockInicialTouched] = useState(false);
  const [imagenTouched, setImagenTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Validaciones en tiempo real
  const nombreValido = form.nombre.trim().length > 5;
  const precioValido = form.precio !== '' && Number(form.precio) > 0;
  const stockInicialValido = form.stockInicial === '' || (Number(form.stockInicial) >= 0 && Number.isInteger(Number(form.stockInicial)));
  const imagenValida = !form.imagen.trim() || /^https?:\/\/.+/i.test(form.imagen.trim());

  const nombreError = (nombreTouched || submitted) && !nombreValido && 'El nombre del producto es obligatorio.';
  const precioError = (precioTouched || submitted) && (
    form.precio === ''
      ? 'El precio es obligatorio.'
      : !precioValido
      ? 'El precio debe ser un número mayor a 0.'
      : null
  );
  const stockInicialError = (stockInicialTouched || submitted) && !stockInicialValido && 'El stock inicial debe ser un número entero no negativo.';
  const imagenError = (imagenTouched || submitted) && !imagenValida && 'La URL de la imagen debe ser válida (empezar con http:// o https://).';

  const cargarDatos = () => {
    setCargando(true);
    Promise.all([inventarioApi.get('/inventario'), productosApi.get('/productos')])
      .then(([invRes, prodRes]) => {
        setInventario(invRes.data);
        setProductos(prodRes.data);
      })
      .catch(err => console.error('Error cargando inventario:', err))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargarDatos(); }, []);

  const getNombre = (productoId) => {
    const p = productos.find(p => p._id === productoId);
    return p ? p.nombre : `ID: ${productoId}`;
  };

const agregarStock = async (item) => {

  const cantidadStr = window.prompt(
    '¿Cuántas unidades agregar?',
    '10'
  );

  const cantidad = Number(cantidadStr);

  if (!cantidadStr || isNaN(cantidad) || cantidad <= 0)
    return;

  try {

    const nuevoStock = item.stock + cantidad;

    await inventarioApi.patch('/inventario/agregar-stock', {
      productoId: item.productoId,
      cantidad
    });

    setInventario(prev =>
      prev.map(i =>
        i._id === item._id
          ? { ...i, stock: nuevoStock }
          : i
      )
    );

  } catch (err) {

    alert(
      'Error al actualizar stock: ' +
      (err.response?.data?.mensaje || err.message)
    );

  }
};

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoImg(true);
    try {
      const data = new FormData();
      data.append('imagen', file);
      const res = await productosApi.post('/productos/upload-imagen', data);
      setForm(f => ({ ...f, imagen: res.data.url }));
      setPreviewImagen(res.data.url);
    } catch {
      alert('Error al subir la imagen. Intenta con una URL.');
    } finally {
      setSubiendoImg(false);
    }
  };

  const handleUrlChange = (e) => {
    setForm(f => ({ ...f, imagen: e.target.value }));
    setPreviewImagen(e.target.value);
  };

  const handleGuardar = async () => {
    setSubmitted(true);
    if (!nombreValido || !precioValido || !stockInicialValido || !imagenValida) {
      setError('Por favor, corrige los errores en el formulario.');
      return;
    }
    setError('');
    setGuardando(true);
    try {
      if (form._id) {
        // Editar producto existente
        await productosApi.put(`/productos/${form._id}`, {
          nombre: form.nombre.trim(),
          precio: Number(form.precio),
          categoria: form.categoria,
          descripcion: form.descripcion.trim(),
          imagen: form.imagen.trim(),
          disponible: form.disponible,
        });
      } else {
        // Crear nuevo producto
        const producto = await productosApi.post('/productos', {
          nombre: form.nombre.trim(),
          precio: Number(form.precio),
          categoria: form.categoria,
          descripcion: form.descripcion.trim(),
          imagen: form.imagen.trim(),
          disponible: form.disponible,
        });
        await inventarioApi.post('/inventario', {
          productoId: producto.data._id,
          stock: Number(form.stockInicial) || 0,
        });
      }
      setModalAbierto(false);
      setForm(formVacio);
      setPreviewImagen('');
      cargarDatos();
    } catch (err) {
      setError('Error al guardar: ' + (err.response?.data?.error || err.message));
    } finally {
      setGuardando(false);
    }
  };

  const abrirModal = (item = null) => {
    setNombreTouched(false);
    setPrecioTouched(false);
    setStockInicialTouched(false);
    setImagenTouched(false);
    setSubmitted(false);

    if (item && item.productoId) {
      const prod = productos.find(p => p._id === item.productoId);
      if (prod) {
        setForm({
          _id: prod._id,
          nombre: prod.nombre,
          precio: prod.precio,
          categoria: prod.categoria || 'General',
          descripcion: prod.descripcion || '',
          imagen: prod.imagen || '',
          disponible: prod.disponible,
          stockInicial: item.stock
        });
        setPreviewImagen(prod.imagen || '');
        setTabImagen(prod.imagen ? 'url' : 'archivo');
      }
    } else {
      setForm(formVacio);
      setPreviewImagen('');
      setTabImagen('url');
    }
    setError('');
    setModalAbierto(true);
  };

  const eliminarProducto = async (item) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto del menú? Esto no se puede deshacer.')) return;
    
    try {
      await productosApi.delete(`/productos/${item.productoId}`);
      await inventarioApi.delete(`/inventario/${item.productoId}`);
      cargarDatos();
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.error || err.message));
    }
  };

  const totalSKU = inventario.length;
  const criticos = inventario.filter(i => i.stock <= 2).length;
  const valorTotal = inventario.reduce((s, i) => {
    const p = productos.find(p => p._id === i.productoId);
    return s + (p ? p.precio * i.stock : 0);
  }, 0);

  const filtrados = inventario.filter(i =>
    filtro === '' || getNombre(i.productoId).toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex justify-between items-center w-full px-6 py-4 bg-neutral-950 border-b border-neutral-800 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="md:hidden text-orange-500 font-black text-xl">La Terraza del Mar</span>
            <h2 className="hidden md:block text-headline-md text-on-surface">Inventory Management</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">search</span>
              <input
                className="bg-neutral-900 border border-neutral-800 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500 transition-colors w-64"
                placeholder="Buscar ingrediente..."
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Total SKU</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-on-surface">{totalSKU}</span>
                <span className="text-green-400 text-xs font-bold">productos</span>
              </div>
            </div>
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Valor Inventario</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-on-surface">${valorTotal.toFixed(0)}</span>
                <span className="text-neutral-400 text-xs font-bold">USD</span>
              </div>
            </div>
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 border-l-4 border-l-orange-500">
              <span className="text-orange-500 text-xs font-bold uppercase tracking-wider">Bajo Inventario</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-orange-500">{criticos}</span>
                <span className="text-orange-500/70 text-xs font-bold">Crítico</span>
              </div>
            </div>
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Total Unidades</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-on-surface">{inventario.reduce((s, i) => s + i.stock, 0)}</span>
                <span className="text-green-400 text-xs font-bold">en stock</span>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
            <div className="px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-neutral-800">
              <button
                onClick={() => abrirModal()}
                className="bg-primary-container text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 active:scale-95 transition-transform hover:bg-orange-600"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                NUEVO PRODUCTO
              </button>
              <button className="text-neutral-400 hover:text-on-surface text-sm flex items-center gap-1">
                <span className="material-symbols-outlined">filter_list</span>
                Filtros Avanzados
              </button>
            </div>

            {cargando ? (
              <div className="flex justify-center py-12">
                <span className="text-orange-500 animate-pulse">Cargando inventario...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-neutral-950 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Ingrediente</th>
                      <th className="px-6 py-4">Stock Actual</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {filtrados.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                          {inventario.length === 0
                            ? 'No hay registros de inventario. Asegúrate de que el servicio esté corriendo en el puerto 3002.'
                            : 'No se encontraron resultados para tu búsqueda.'}
                        </td>
                      </tr>
                    ) : filtrados.map(item => {
                      const estado = getEstado(item.stock);
                      return (
                        <tr key={item._id} className="hover:bg-neutral-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-neutral-500">inventory_2</span>
                              </div>
                              <span className="font-bold text-on-surface">{getNombre(item.productoId)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-bold ${estado.color}`}>{item.stock}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`${estado.bg} ${estado.color} px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight`}>
                              {estado.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button
                              onClick={() => agregarStock(item)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                                item.stock <= 10
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                              }`}
                            >
                              + Stock
                            </button>
                            <button
                              onClick={() => abrirModal(item)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                            <button
                              onClick={() => eliminarProducto(item)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-6 py-4 flex items-center justify-between border-t border-neutral-800">
              <span className="text-xs text-neutral-500">
                Mostrando {filtrados.length} de {inventario.length} registros
              </span>
              <div className="flex gap-2">
                <button className="p-2 border border-neutral-800 rounded-lg text-neutral-500 hover:bg-neutral-800 transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="p-2 border border-neutral-800 rounded-lg text-neutral-500 hover:bg-neutral-800 transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav admin />

      {/* Modal nuevo producto */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800">
              <h3 className="font-bold text-lg text-on-surface">{form._id ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setModalAbierto(false)} className="text-neutral-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              {/* Nombre */}
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Nombre *</label>
                <input
                  className={`mt-1 w-full bg-neutral-800 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors ${
                    nombreError ? 'border-red-500' : 'border-neutral-700'
                  }`}
                  placeholder="Ej. Burger BBQ"
                  value={form.nombre}
                  onBlur={() => setNombreTouched(true)}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                />
                {nombreError && (
                  <p className="text-red-400 text-xs mt-1 pl-1">{nombreError}</p>
                )}
              </div>

              {/* Precio y Categoría */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Precio *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`mt-1 w-full bg-neutral-800 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors ${
                      precioError ? 'border-red-500' : 'border-neutral-700'
                    }`}
                    placeholder="0.00"
                    value={form.precio}
                    onBlur={() => setPrecioTouched(true)}
                    onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
                  />
                  {precioError && (
                    <p className="text-red-400 text-xs mt-1 pl-1">{precioError}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Categoría</label>
                  <select
                    className="mt-1 w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    value={form.categoria}
                    onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  >
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Descripción</label>
                <textarea
                  rows={2}
                  className="mt-1 w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  placeholder="Describe el producto..."
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                />
              </div>

              {/* Stock inicial */}
              <div className={form._id ? 'opacity-50 pointer-events-none' : ''}>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Stock Inicial</label>
                <input
                  type="number"
                  min="0"
                  disabled={!!form._id}
                  className={`mt-1 w-full bg-neutral-800 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors ${
                    stockInicialError ? 'border-red-500' : 'border-neutral-700'
                  }`}
                  placeholder="10"
                  value={form.stockInicial}
                  onBlur={() => setStockInicialTouched(true)}
                  onChange={e => setForm(f => ({ ...f, stockInicial: e.target.value }))}
                />
                {stockInicialError && (
                  <p className="text-red-400 text-xs mt-1 pl-1">{stockInicialError}</p>
                )}
              </div>

              {/* Disponible */}
              <div className="flex items-center justify-between bg-neutral-800 rounded-lg px-4 py-3">
                <span className="text-sm font-semibold text-on-surface">Disponible en el menú</span>
                <button
                  onClick={() => setForm(f => ({ ...f, disponible: !f.disponible }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${form.disponible ? 'bg-orange-500' : 'bg-neutral-600'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.disponible ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Imagen */}
              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Imagen del producto</label>
                {/* Tabs */}
                <div className="flex mt-2 mb-3 border border-neutral-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setTabImagen('url')}
                    className={`flex-1 py-2 text-xs font-bold transition-colors ${tabImagen === 'url' ? 'bg-orange-500 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                  >
                    Pegar URL
                  </button>
                  <button
                    onClick={() => setTabImagen('archivo')}
                    className={`flex-1 py-2 text-xs font-bold transition-colors ${tabImagen === 'archivo' ? 'bg-orange-500 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                  >
                    Subir foto
                  </button>
                </div>

                {tabImagen === 'url' ? (
                  <div>
                    <input
                      className={`w-full bg-neutral-800 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors ${
                        imagenError ? 'border-red-500' : 'border-neutral-700'
                      }`}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={form.imagen}
                      onBlur={() => setImagenTouched(true)}
                      onChange={handleUrlChange}
                    />
                    {imagenError && (
                      <p className="text-red-400 text-xs mt-1 pl-1">{imagenError}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    <button
                      onClick={() => fileRef.current.click()}
                      disabled={subiendoImg}
                      className="w-full border-2 border-dashed border-neutral-700 rounded-lg py-6 flex flex-col items-center gap-2 text-neutral-400 hover:border-orange-500 hover:text-orange-400 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-3xl">
                        {subiendoImg ? 'hourglass_empty' : 'upload_file'}
                      </span>
                      <span className="text-xs font-semibold">
                        {subiendoImg ? 'Subiendo...' : 'Haz clic para elegir una foto'}
                      </span>
                      <span className="text-[10px] text-neutral-600">JPG, PNG, WEBP — máx. 5 MB</span>
                    </button>
                  </div>
                )}

                {/* Preview */}
                {previewImagen && (
                  <div className="mt-3 relative">
                    <img
                      src={previewImagen}
                      alt="preview"
                      className="w-full h-40 object-cover rounded-lg border border-neutral-700"
                      onError={() => setPreviewImagen('')}
                    />
                    <button
                      onClick={() => { setPreviewImagen(''); setForm(f => ({ ...f, imagen: '' })); }}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-red-400 text-xs font-semibold bg-red-500/10 px-4 py-2 rounded-lg">{error}</p>
              )}
            </div>

            {/* Footer modal */}
            <div className="px-6 py-4 border-t border-neutral-800 flex gap-3 justify-end">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-primary-container text-white hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {guardando && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                {guardando ? 'Guardando...' : 'Guardar Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
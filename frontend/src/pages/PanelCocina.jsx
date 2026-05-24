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
      // Filtro de seguridad en el frontend: nunca mostrar entregados/cancelados en la sección activa
      const activos = (data.datos || data).filter(
        p => !['entregado', 'cancelado'].includes(p.estado)
      );
      setPedidos(activos);
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

  const eliminarDelHistorial = async (id) => {
    if (!window.confirm('¿Eliminar este pedido del historial?')) return;
    try {
      await pedidosApi.delete(`/pedidos/${id}`);
      cargarHistorial(pagina);
    } catch (err) {
      console.error('Error eliminando pedido:', err.response?.data || err.message);
    }
  };

  const eliminarTodoHistorial = async () => {
    if (!window.confirm('¿Eliminar TODO el historial? Esta acción no se puede deshacer.')) return;
    try {
      await pedidosApi.delete('/pedidos/historial/todos');
      setHistorial([]);
      setTotalPaginas(1);
      setPagina(1);
    } catch (err) {
      console.error('Error eliminando historial:', err.response?.data || err.message);
    }
  };

  const descargarReporte = async () => {
    try {
      const { data } = await pedidosApi.get('/pedidos?estado=entregado&limit=1000');
      const todos = data.datos || [];
      if (todos.length === 0) { alert('No hay pedidos en el historial para exportar.'); return; }

      // Agrupar por mes
      const porMes = {};
      todos.forEach(p => {
        const d   = new Date(p.fecha);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const nom = d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
        if (!porMes[key]) porMes[key] = { nombre: nom, pedidos: [], total: 0 };
        porMes[key].pedidos.push(p);
        porMes[key].total += p.total || 0;
      });

      const totalGeneral = todos.reduce((s, p) => s + (p.total || 0), 0);
      const promedio     = totalGeneral / todos.length;
      const fechaHoy     = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

      const mesRows = Object.entries(porMes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, m]) => {
          const pct = ((m.total / totalGeneral) * 100).toFixed(1);
          const avg = (m.total / m.pedidos.length).toFixed(2);
          return `<tr>
            <td style="padding:9px 14px;border-bottom:1px solid #fde8d0;text-transform:capitalize;color:#1a1a1a">${m.nombre}</td>
            <td style="padding:9px 14px;border-bottom:1px solid #fde8d0;text-align:center;color:#444">${m.pedidos.length}</td>
            <td style="padding:9px 14px;border-bottom:1px solid #fde8d0;font-weight:bold;color:#c05e00">$${m.total.toFixed(2)}</td>
            <td style="padding:9px 14px;border-bottom:1px solid #fde8d0;text-align:center">
              <span style="background:#fff3e0;color:#e65100;padding:3px 10px;border-radius:12px;font-weight:bold;font-size:12px">${pct}%</span>
            </td>
            <td style="padding:9px 14px;border-bottom:1px solid #fde8d0;color:#888">$${avg}</td>
          </tr>`;
        }).join('');

      const detalleRows = [...todos]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .map((p, i) => {
          const bg       = i % 2 === 0 ? '#ffffff' : '#fdf8f4';
          const articulos = p.detalle?.map(d => `${d.cantidad}× ${d.nombre}`).join(', ') || '-';
          return `<tr style="background:${bg}">
            <td style="padding:7px 14px;border-bottom:1px solid #f5ece4;color:#888;font-size:11px;font-family:monospace">#${p._id.slice(-6).toUpperCase()}</td>
            <td style="padding:7px 14px;border-bottom:1px solid #f5ece4;font-size:12px;color:#555">${new Date(p.fecha).toLocaleString('es-MX')}</td>
            <td style="padding:7px 14px;border-bottom:1px solid #f5ece4;font-size:12px">${p.cliente?.nombre || 'Cliente'}</td>
            <td style="padding:7px 14px;border-bottom:1px solid #f5ece4;font-size:11px;color:#777">${articulos}</td>
            <td style="padding:7px 14px;border-bottom:1px solid #f5ece4;font-weight:bold;color:#c05e00;font-size:13px">$${(p.total || 0).toFixed(2)}</td>
          </tr>`;
        }).join('');

      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>
<x:ExcelWorksheet><x:Name>Reporte de Ventas</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background:#f5f0eb">
<div style="font-family:Georgia,'Times New Roman',serif;max-width:860px;margin:0 auto;padding:40px 32px;background:#f5f0eb">

  <!-- ══════════════ ENCABEZADO ELEGANTE ══════════════ -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:36px">
    <tr>
      <td style="background:#1a0e05;border-radius:16px;padding:0;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.25)">

        <!-- Banda superior dorada -->
        <div style="background:linear-gradient(90deg,#8B5E00,#f27a18,#e8a020,#f27a18,#8B5E00);height:5px"></div>

        <!-- Contenido centrado -->
        <div style="padding:44px 48px 40px;text-align:center">

          <!-- Ornamento superior -->
          <div style="font-size:13px;color:#8B6030;letter-spacing:6px;text-transform:uppercase;margin-bottom:20px;font-family:Arial,sans-serif">
            ─── &nbsp; ✦ &nbsp; ───
          </div>

          <!-- Nombre del restaurante -->
          <div style="font-size:52px;font-weight:bold;color:#f27a18;letter-spacing:2px;line-height:1;font-family:Georgia,serif;text-shadow:0 0 40px rgba(242,122,24,0.25)">
            La Terraza del Mar
          </div>

          <!-- Línea decorativa naranja -->
          <div style="margin:18px auto;width:120px;height:2px;background:linear-gradient(90deg,transparent,#f27a18,transparent)"></div>

          <!-- Subtítulo del reporte -->
          <div style="font-size:18px;color:#d4a574;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:300;margin-bottom:6px">
            Reporte de Ventas
          </div>
          <div style="font-size:13px;color:#7a5535;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif">
            Pedidos Entregados
          </div>

          <!-- Ornamento inferior -->
          <div style="font-size:13px;color:#8B6030;letter-spacing:6px;margin-top:20px;font-family:Arial,sans-serif">
            ─── &nbsp; ✦ &nbsp; ───
          </div>

          <!-- Fecha y total de pedidos -->
          <table style="width:100%;border-collapse:collapse;margin-top:28px">
            <tr>
              <td style="width:50%;text-align:center;padding:14px 20px;border-right:1px solid #3a2010">
                <div style="font-size:10px;color:#7a5535;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif;margin-bottom:6px">Fecha de emisión</div>
                <div style="font-size:15px;color:#d4a574;font-family:Arial,sans-serif;font-weight:600">${fechaHoy}</div>
              </td>
              <td style="width:50%;text-align:center;padding:14px 20px">
                <div style="font-size:10px;color:#7a5535;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif;margin-bottom:6px">Total de pedidos</div>
                <div style="font-size:28px;font-weight:900;color:#f27a18;font-family:Arial,sans-serif;line-height:1">${todos.length}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Banda inferior dorada -->
        <div style="background:linear-gradient(90deg,#8B5E00,#f27a18,#e8a020,#f27a18,#8B5E00);height:5px"></div>
      </td>
    </tr>
  </table>

  <!-- ══════════════ TARJETAS RESUMEN ══════════════ -->
  <table style="width:100%;border-collapse:separate;border-spacing:10px;margin-bottom:32px">
    <tr>
      <td style="background:#fff;border:1px solid #e8d5c0;border-top:3px solid #f27a18;border-radius:10px;padding:22px 20px;text-align:center;width:33%;vertical-align:top;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <div style="font-size:10px;color:#b08050;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;font-family:Arial,sans-serif">Total de Pedidos</div>
        <div style="font-size:40px;font-weight:900;color:#1a1a1a;margin:10px 0 4px;line-height:1;font-family:Arial,sans-serif">${todos.length}</div>
        <div style="font-size:11px;color:#f27a18;font-family:Arial,sans-serif">pedidos entregados</div>
      </td>
      <td style="background:#fff;border:1px solid #e8d5c0;border-top:3px solid #c05e00;border-radius:10px;padding:22px 20px;text-align:center;width:33%;vertical-align:top;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <div style="font-size:10px;color:#b08050;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;font-family:Arial,sans-serif">Ingresos Totales</div>
        <div style="font-size:40px;font-weight:900;color:#c05e00;margin:10px 0 4px;line-height:1;font-family:Arial,sans-serif">$${totalGeneral.toFixed(2)}</div>
        <div style="font-size:11px;color:#a08060;font-family:Arial,sans-serif">suma total de ventas</div>
      </td>
      <td style="background:#fff;border:1px solid #e8d5c0;border-top:3px solid #e8a020;border-radius:10px;padding:22px 20px;text-align:center;width:33%;vertical-align:top;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <div style="font-size:10px;color:#b08050;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;font-family:Arial,sans-serif">Promedio por Pedido</div>
        <div style="font-size:40px;font-weight:900;color:#1a1a1a;margin:10px 0 4px;line-height:1;font-family:Arial,sans-serif">$${promedio.toFixed(2)}</div>
        <div style="font-size:11px;color:#a08060;font-family:Arial,sans-serif">valor promedio</div>
      </td>
    </tr>
  </table>

  <!-- ══════════════ RESUMEN MENSUAL ══════════════ -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
    <tr>
      <td style="padding-bottom:10px">
        <div style="font-size:14px;font-weight:bold;color:#1a1a1a;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif;display:inline-block;border-bottom:2px solid #f27a18;padding-bottom:4px">
          Resumen por Mes
        </div>
      </td>
    </tr>
  </table>
  <table style="width:100%;border-collapse:collapse;margin-bottom:32px;border:1px solid #e8d5c0;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05)">
    <thead>
      <tr style="background:#1a0e05">
        <th style="padding:12px 16px;color:#f27a18;text-align:left;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif">Mes</th>
        <th style="padding:12px 16px;color:#f27a18;text-align:center;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif">Pedidos</th>
        <th style="padding:12px 16px;color:#f27a18;text-align:left;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif">Ingresos</th>
        <th style="padding:12px 16px;color:#f27a18;text-align:center;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif">% del Total</th>
        <th style="padding:12px 16px;color:#f27a18;text-align:left;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif">Promedio</th>
      </tr>
    </thead>
    <tbody>
      ${mesRows}
      <tr style="background:#fff8f0">
        <td style="padding:12px 16px;border-top:2px solid #f27a18;color:#c05e00;font-weight:bold;font-family:Arial,sans-serif;letter-spacing:0.5px">TOTAL GENERAL</td>
        <td style="padding:12px 16px;border-top:2px solid #f27a18;text-align:center;color:#c05e00;font-weight:bold;font-family:Arial,sans-serif">${todos.length}</td>
        <td style="padding:12px 16px;border-top:2px solid #f27a18;color:#c05e00;font-weight:bold;font-family:Arial,sans-serif">$${totalGeneral.toFixed(2)}</td>
        <td style="padding:12px 16px;border-top:2px solid #f27a18;text-align:center;color:#c05e00;font-weight:bold;font-family:Arial,sans-serif">100%</td>
        <td style="padding:12px 16px;border-top:2px solid #f27a18;color:#c05e00;font-weight:bold;font-family:Arial,sans-serif">$${promedio.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <!-- ══════════════ DETALLE DE PEDIDOS ══════════════ -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
    <tr>
      <td style="padding-bottom:10px">
        <div style="font-size:14px;font-weight:bold;color:#1a1a1a;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif;display:inline-block;border-bottom:2px solid #f27a18;padding-bottom:4px">
          Detalle de Pedidos
        </div>
      </td>
    </tr>
  </table>
  <table style="width:100%;border-collapse:collapse;border:1px solid #e8d5c0;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05)">
    <thead>
      <tr style="background:#1a0e05">
        <th style="padding:12px 16px;color:#f27a18;text-align:left;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif">Pedido</th>
        <th style="padding:12px 16px;color:#f27a18;text-align:left;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif">Fecha</th>
        <th style="padding:12px 16px;color:#f27a18;text-align:left;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif">Cliente</th>
        <th style="padding:12px 16px;color:#f27a18;text-align:left;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif">Artículos</th>
        <th style="padding:12px 16px;color:#f27a18;text-align:left;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif">Total</th>
      </tr>
    </thead>
    <tbody>${detalleRows}</tbody>
  </table>

  <!-- PIE DE PÁGINA -->
  <div style="margin-top:36px;padding:16px 0;border-top:1px solid #d8c5b0;text-align:center">
    <div style="font-size:13px;color:#8B6030;letter-spacing:4px;font-family:Arial,sans-serif;margin-bottom:6px">✦ &nbsp; ✦ &nbsp; ✦</div>
    <div style="font-size:11px;color:#b09070;font-family:Arial,sans-serif;letter-spacing:0.3px">
      © ${new Date().getFullYear()} &nbsp;<strong>La Terraza del Mar</strong>&nbsp; · &nbsp;Reporte generado el ${fechaHoy}
    </div>
  </div>
</div>
</body></html>`;

      const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `reporte-ventas-${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando reporte:', err);
      alert('Error al generar el reporte.');
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
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-on-surface">Historial de pedidos</h3>
              <div className="flex gap-2">
                <button
                  onClick={descargarReporte}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Descargar Reporte
                </button>
                {historial.length > 0 && (
                  <button
                    onClick={eliminarTodoHistorial}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete_sweep</span>
                    Limpiar historial
                  </button>
                )}
              </div>
            </div>
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
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-bold text-xs bg-green-400/10 px-2 py-1 rounded-full border border-green-500/20">
                        Entregado
                      </span>
                      <button
                        onClick={() => eliminarDelHistorial(pedido._id)}
                        className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
                        title="Eliminar del historial"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
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

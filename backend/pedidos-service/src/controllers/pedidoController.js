const Pedido = require('../models/Pedido');
const { ESTADOS_VALIDOS } = require('../models/Pedido');
const axios = require('axios');

const PRODUCTOS_URL = process.env.PRODUCTOS_URL || 'http://localhost:3001/productos';
const INVENTARIO_URL = process.env.INVENTARIO_URL || 'http://localhost:3002/inventario';

const crearPedido = async (req, res) => {
    try {
        const { cliente, items, direccion, referencia, metodoPago, propina } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                mensaje: "Se requiere un arreglo 'items' con al menos un elemento"
            });
        }

        let total = 0;
        const detalle = [];

        // 1. Obtener TODOS los productos de una sola vez para buscar los precios
        let catalogoProductos = [];
        try {
            const resProds = await axios.get(PRODUCTOS_URL);
            catalogoProductos = resProds.data;
        } catch (error) {
            console.warn("No se pudo obtener el catalogo de productos:", error.message);
        }

        // 2. Obtener el inventario actual para validar stock antes de crear el pedido
        let catalogoInventario = [];
        try {
            const resInv = await axios.get(INVENTARIO_URL);
            catalogoInventario = resInv.data;
        } catch (error) {
            return res.status(500).json({ error: "Error al verificar la disponibilidad en el inventario." });
        }

        for (const item of items) {
            const producto = catalogoProductos.find(p => p._id === item.productoId);
            
            if (producto) {
                // Verificar que haya stock suficiente para este producto
                const invItem = catalogoInventario.find(i => i.productoId === item.productoId);
                if (!invItem || invItem.stock < item.cantidad) {
                    return res.status(400).json({
                        error: `Stock insuficiente para '${producto.nombre}'. Solicitado: ${item.cantidad}, Disponible: ${invItem ? invItem.stock : 0}`
                    });
                }

                total += producto.precio * item.cantidad;
                detalle.push({
                    productoId: item.productoId,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    cantidad: item.cantidad
                });
            } else {
                console.warn(`Producto no encontrado en el catalogo: ${item.productoId}`);
                detalle.push({ ...item, nombre: 'Producto desconocido', precio: 0 });
            }
        }

        const propinaNum = Number(propina) || 0;
        total += propinaNum;

        // Guardar pedido primero
        const pedido = new Pedido({ cliente, detalle, total, direccion, referencia, metodoPago, propina: propinaNum });
        await pedido.save();

        // Actualizar inventario de cada producto en el pedido
        for (const item of items) {
            try {
                await axios.post(`${INVENTARIO_URL}/actualizar-stock`, {
                    productoId: item.productoId,
                    cantidad: item.cantidad
                });
            } catch (invErr) {
                console.warn(`Inventario no actualizado para ${item.productoId}:`, invErr.message);
            }
        }

        res.status(201).json({
            mensaje: "Pedido creado",
            pedido
        });

    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json({
            mensaje: "Error al crear pedido",
            error: error.response?.data || error.message
        });
    }
};

const obtenerPedidos = async (req, res) => {
    try {
        const { estado, fechaInicio, fechaFin, page, limit } = req.query;
        const filtro = {};

        if (estado) {
            if (estado.includes(',')) {
                filtro.estado = { $in: estado.split(',') };
            } else {
                filtro.estado = estado;
            }
        }

        // Filtrar por rango de fechas (Historial)
        if (fechaInicio || fechaFin) {
            filtro.fecha = {};
            if (fechaInicio) filtro.fecha.$gte = new Date(fechaInicio); // Mayor o igual que
            if (fechaFin) filtro.fecha.$lte = new Date(fechaFin);       // Menor o igual que
        }

        // Configuración de paginación
        const numPage = parseInt(page) || 1;
        const numLimit = parseInt(limit) || 50;
        const skip = (numPage - 1) * numLimit;

        const totalPedidos = await Pedido.countDocuments(filtro);
        const pedidos = await Pedido.find(filtro).sort({ fecha: -1 }).skip(skip).limit(numLimit);

        res.json({
            total: totalPedidos,
            paginaActual: numPage,
            totalPaginas: Math.ceil(totalPedidos / numLimit) || 1,
            datos: pedidos
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerPedidoPorId = async (req, res) => {
    try {
        const pedido = await Pedido.findById(req.params.id);
        if (!pedido) {
            return res.status(404).json({ mensaje: "Pedido no encontrado" });
        }
        res.json(pedido);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const cambiarEstado = async (req, res) => {
    try {
        const { estado } = req.body;

        if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
            return res.status(400).json({
                mensaje: `Estado invalido. Permitidos: ${ESTADOS_VALIDOS.join(', ')}`
            });
        }

        const pedido = await Pedido.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true, runValidators: true }
        );

        if (!pedido) {
            return res.status(404).json({ mensaje: "Pedido no encontrado" });
        }

        console.log(`[NOTIFICACION] Pedido ${pedido._id} cambio a estado: ${estado}`);

        res.json({ mensaje: "Estado actualizado", pedido });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarPedido = async (req, res) => {
    try {
        const pedido = await Pedido.findByIdAndDelete(req.params.id);
        if (!pedido) {
            return res.status(404).json({ mensaje: "Pedido no encontrado" });
        }
        res.json({ mensaje: "Pedido eliminado", pedido });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarHistorial = async (req, res) => {
    try {
        const resultado = await Pedido.deleteMany({ estado: 'entregado' });
        res.json({ mensaje: `${resultado.deletedCount} pedidos eliminados del historial.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    crearPedido,
    obtenerPedidos,
    obtenerPedidoPorId,
    cambiarEstado,
    eliminarPedido,
    eliminarHistorial,
};
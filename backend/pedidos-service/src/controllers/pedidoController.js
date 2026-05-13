const Pedido = require('../models/Pedido');
const { ESTADOS_VALIDOS } = require('../models/Pedido');
const axios = require('axios');

const PRODUCTOS_URL = 'http://localhost:3001/productos';
const INVENTARIO_URL = 'http://localhost:3002/inventario';

const crearPedido = async (req, res) => {
    try {
        const { cliente, items } = req.body;

        if (!cliente || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                mensaje: "Se requiere 'cliente' y un arreglo 'items' con al menos un elemento"
            });
        }

        // 1. Consumir productos-service para obtener nombre y precio actuales
        const { data: productos } = await axios.get(PRODUCTOS_URL);
        const productoMap = new Map(productos.map(p => [p._id, p]));

        const detalle = [];
        let total = 0;

        for (const item of items) {
            if (!item.productoId || !item.cantidad || item.cantidad < 1) {
                return res.status(400).json({
                    mensaje: "Cada item debe tener productoId y cantidad >= 1"
                });
            }

            const producto = productoMap.get(item.productoId);
            if (!producto) {
                return res.status(404).json({
                    mensaje: `Producto ${item.productoId} no existe`
                });
            }

            detalle.push({
                productoId: item.productoId,
                nombre: producto.nombre,
                cantidad: item.cantidad,
                precio: producto.precio
            });
            total += producto.precio * item.cantidad;
        }

        // 2. Consumir inventario-service para reducir stock de cada item
        for (const item of items) {
            await axios.post(`${INVENTARIO_URL}/actualizar-stock`, {
                productoId: item.productoId,
                cantidad: item.cantidad
            });
        }

        // 3. Persistir pedido
        const pedido = new Pedido({ cliente, detalle, total });
        await pedido.save();

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
        const { estado } = req.query;
        const filtro = estado ? { estado } : {};
        const pedidos = await Pedido.find(filtro).sort({ fecha: -1 });
        res.json(pedidos);
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

module.exports = {
    crearPedido,
    obtenerPedidos,
    obtenerPedidoPorId,
    cambiarEstado,
    eliminarPedido
};
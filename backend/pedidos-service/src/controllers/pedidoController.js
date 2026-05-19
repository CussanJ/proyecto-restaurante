const Pedido = require('../models/Pedido');
const { ESTADOS_VALIDOS } = require('../models/Pedido');
const axios = require('axios');

const PRODUCTOS_URL = 'http://localhost:3001/productos';
const INVENTARIO_URL = 'http://localhost:3002/inventario';

const crearPedido = async (req, res) => {
    try {
        const { productoId, cantidad } = req.body;

        // Guardar pedido primero
        const pedido = new Pedido({ productoId, cantidad });
        await pedido.save();

        // Actualizar inventario (si falla, el pedido ya quedó guardado)
        try {
            await axios.post('http://localhost:3002/inventario/actualizar-stock', {
                productoId,
                cantidad
            });
        } catch (invErr) {
            console.warn('Inventario no actualizado:', invErr.message);
        }

        // Actualizar inventario (si falla, el pedido ya quedó guardado)
        try {
            await axios.post('http://localhost:3002/inventario/actualizar-stock', {
                productoId,
                cantidad
            });
        } catch (invErr) {
            console.warn('Inventario no actualizado:', invErr.message);
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
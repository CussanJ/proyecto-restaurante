const Pedido = require('../models/Pedido');
const axios = require('axios');

// Crear pedido (valida inventario y guarda)
const crearPedido = async (req, res) => {
    try {
        const { items, total, direccion, referencia, metodoPago, cliente } = req.body;

        // Validar datos
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'El pedido debe tener al menos un producto.' });
        }
        if (!direccion) {
            return res.status(400).json({ error: 'La dirección es requerida.' });
        }

        // Validar inventario para cada ítem
        for (const item of items) {
            try {
                await axios.post('http://localhost:3002/inventario/validar-stock', {
                    productoId: item.productoId,
                    cantidad: item.cantidad
                });
            } catch (err) {
                return res.status(400).json({
                    error: `Stock insuficiente para ${item.nombre || item.productoId}`,
                    detalles: err.response?.data
                });
            }
        }

        // Decrementar stock para cada ítem
        for (const item of items) {
            try {
                await axios.post('http://localhost:3002/inventario/actualizar-stock', {
                    productoId: item.productoId,
                    cantidad: item.cantidad
                });
            } catch (err) {
                return res.status(500).json({
                    error: 'Error al actualizar inventario',
                    detalles: err.response?.data
                });
            }
        }

        // Crear el pedido
        const pedido = new Pedido({
            items,
            total: Number(total),
            direccion: direccion.trim(),
            referencia: referencia ? referencia.trim() : '',
            metodoPago: metodoPago || 'efectivo',
            cliente: cliente || {},
            estado: 'pendiente',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await pedido.save();

        // Log para notificaciones
        console.log(`📦 NUEVO PEDIDO #${pedido._id} - ${items.length} item(s) - Total: $${total}`);

        res.status(201).json({
            mensaje: 'Pedido creado exitosamente',
            pedido: pedido
        });

    } catch (error) {
        console.error('❌ Error al crear pedido:', error.message);
        res.status(500).json({
            error: 'Error al crear pedido',
            detalles: error.message
        });
    }
};

// Obtener todos los pedidos (con filtros opcionales)
const obtenerPedidos = async (req, res) => {
    try {
        const { estado, limite = 50, pagina = 1 } = req.query;
        
        let filtro = {};
        if (estado) {
            filtro.estado = estado;
        }

        const saltar = (Number(pagina) - 1) * Number(limite);
        
        const pedidos = await Pedido.find(filtro)
            .sort({ createdAt: -1 })
            .limit(Number(limite))
            .skip(saltar);

        const total = await Pedido.countDocuments(filtro);

        res.json({
            pedidos,
            total,
            pagina: Number(pagina),
            limite: Number(limite),
            totalPaginas: Math.ceil(total / Number(limite))
        });

    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
};

// Obtener un pedido por ID
const obtenerPedido = async (req, res) => {
    try {
        const { id } = req.params;
        
        const pedido = await Pedido.findById(id);
        
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json(pedido);

    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({ error: 'Error al obtener pedido' });
    }
};

// Actualizar estado del pedido
const actualizarEstadoPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // Validar estado válido
        const estadosValidos = ['pendiente', 'en preparación', 'en camino', 'entregado'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
            });
        }

        const pedido = await Pedido.findByIdAndUpdate(
            id,
            { estado, updatedAt: new Date() },
            { new: true }
        );

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Log de cambio de estado
        console.log(`✅ Pedido #${id} → ${estado.toUpperCase()}`);

        res.json({
            mensaje: 'Estado actualizado',
            pedido
        });

    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

module.exports = {
    crearPedido,
    obtenerPedidos,
    obtenerPedido,
    actualizarEstadoPedido
};
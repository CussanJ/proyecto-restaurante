const Pedido = require('../models/Pedido');
const { ESTADOS_VALIDOS } = require('../models/Pedido');
const axios = require('axios');

<<<<<<< HEAD
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
=======
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
>>>>>>> 7f929fad72b15e0440dea75533dd85950f0da28d
        });
    }
};

<<<<<<< HEAD
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
=======
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
>>>>>>> 7f929fad72b15e0440dea75533dd85950f0da28d
            });
        }

        const pedido = await Pedido.findByIdAndUpdate(
<<<<<<< HEAD
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
=======
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
>>>>>>> 7f929fad72b15e0440dea75533dd85950f0da28d
    }
};

module.exports = {
    crearPedido,
    obtenerPedidos,
<<<<<<< HEAD
    obtenerPedido,
    actualizarEstadoPedido
};
=======
    obtenerPedidoPorId,
    cambiarEstado,
    eliminarPedido
};
>>>>>>> 7f929fad72b15e0440dea75533dd85950f0da28d

const Pedido = require('../models/Pedido');
const axios = require('axios');

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

        res.json({
            mensaje: "Pedido creado",
            pedido
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al crear pedido",
            error: error.response?.data || error.message
        });
    }
};

module.exports = { crearPedido };
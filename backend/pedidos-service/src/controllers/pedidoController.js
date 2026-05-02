const Pedido = require('../models/Pedido');
const axios = require('axios');

const crearPedido = async (req, res) => {
    try {
        const { productoId, cantidad } = req.body;

        // Llamar a inventario
        await axios.post('http://localhost:3002/inventario/actualizar-stock', {
            productoId,
            cantidad
        });

        // Guardar pedido
        const pedido = new Pedido({ productoId, cantidad });
        await pedido.save();

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
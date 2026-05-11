const express = require('express');
const router = express.Router();

const {
    crearPedido,
    obtenerPedidos,
    obtenerPedido,
    actualizarEstadoPedido
} = require('../controllers/pedidoController');

// Crear pedido
router.post('/', crearPedido);

// Obtener todos los pedidos (con filtros)
router.get('/', obtenerPedidos);

// Obtener pedido por ID
router.get('/:id', obtenerPedido);

// Actualizar estado del pedido
router.patch('/:id', actualizarEstadoPedido);

module.exports = router;
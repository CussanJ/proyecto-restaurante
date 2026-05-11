const express = require('express');
const router = express.Router();

const {
    crearPedido,
    obtenerPedidos,
<<<<<<< HEAD
    obtenerPedido,
    actualizarEstadoPedido
=======
    obtenerPedidoPorId,
    cambiarEstado,
    eliminarPedido
>>>>>>> 7f929fad72b15e0440dea75533dd85950f0da28d
} = require('../controllers/pedidoController');

// Crear pedido
router.post('/', crearPedido);
router.get('/', obtenerPedidos);
router.get('/:id', obtenerPedidoPorId);
router.patch('/:id/estado', cambiarEstado);
router.delete('/:id', eliminarPedido);

<<<<<<< HEAD
// Obtener todos los pedidos (con filtros)
router.get('/', obtenerPedidos);

// Obtener pedido por ID
router.get('/:id', obtenerPedido);

// Actualizar estado del pedido
router.patch('/:id', actualizarEstadoPedido);

module.exports = router;
=======
module.exports = router;
>>>>>>> 7f929fad72b15e0440dea75533dd85950f0da28d

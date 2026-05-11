const express = require('express');
const router = express.Router();

const {
    crearPedido,
    obtenerPedidos,
    obtenerPedidoPorId,
    cambiarEstado,
    eliminarPedido
} = require('../controllers/pedidoController');

router.post('/', crearPedido);
router.get('/', obtenerPedidos);
router.get('/:id', obtenerPedidoPorId);
router.patch('/:id/estado', cambiarEstado);
router.delete('/:id', eliminarPedido);

module.exports = router;

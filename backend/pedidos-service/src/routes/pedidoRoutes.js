const express = require('express');
const router = express.Router();

const {
    crearPedido,
    obtenerPedidos,
    obtenerPedidoPorId,
    cambiarEstado,
    eliminarPedido,
    eliminarHistorial,
} = require('../controllers/pedidoController');

router.post('/', crearPedido);
router.get('/', obtenerPedidos);
router.get('/:id', obtenerPedidoPorId);
router.patch('/:id/estado', cambiarEstado);
// Debe ir ANTES de /:id para que Express no interprete "historial" como un id
router.delete('/historial/todos', eliminarHistorial);
router.delete('/:id', eliminarPedido);

module.exports = router;

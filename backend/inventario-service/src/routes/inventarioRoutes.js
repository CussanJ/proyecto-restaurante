const express = require('express');
const router = express.Router();

const {
    crearInventario,
    obtenerInventario,
    actualizarStock,
    agregarStock,
    eliminarInventario
} = require('../controllers/inventarioController');

router.post('/', crearInventario);
router.get('/', obtenerInventario);

router.post('/actualizar-stock', actualizarStock);
router.patch('/agregar-stock', agregarStock);
router.delete('/:productoId', eliminarInventario);

module.exports = router;
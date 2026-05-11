const express = require('express');
const router = express.Router();

const {
    crearInventario,
    obtenerInventario,
    validarStock,
    actualizarStock
} = require('../controllers/inventarioController');

router.post('/', crearInventario);
router.get('/', obtenerInventario);
router.post('/validar-stock', validarStock);
router.post('/actualizar-stock', actualizarStock);

module.exports = router;
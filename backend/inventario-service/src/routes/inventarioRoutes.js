const express = require('express');
const router = express.Router();

const {
    crearInventario,
    obtenerInventario,
    actualizarStock
} = require('../controllers/inventarioController');

router.post('/', crearInventario);
router.get('/', obtenerInventario);
router.post('/actualizar-stock', actualizarStock);

module.exports = router;
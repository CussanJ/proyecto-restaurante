const express = require('express');
const router = express.Router();

const {
    crearInventario,
    obtenerInventario,
    actualizarStock,
    agregarStock
} = require('../controllers/inventarioController');

router.post('/', crearInventario);
router.get('/', obtenerInventario);

router.post('/actualizar-stock', actualizarStock);
router.patch('/agregar-stock', agregarStock);

module.exports = router;
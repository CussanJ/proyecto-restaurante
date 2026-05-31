const express = require('express');
const router = express.Router();

const {
    crearProducto,
    obtenerProductos,
    actualizarProducto,
    eliminarProducto,
    subirImagen,
} = require('../controllers/productoController');

router.post('/upload-imagen', subirImagen);
router.post('/', crearProducto);
router.get('/', obtenerProductos);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;

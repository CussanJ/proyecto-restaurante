const express = require('express');
const router = express.Router();

const {
    crearInventario,
    obtenerInventario
} = require('../controllers/inventarioController');

router.post('/', crearInventario);
router.get('/', obtenerInventario);

module.exports = router;
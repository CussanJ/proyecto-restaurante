const express = require('express');
const router = express.Router();

const { crearPedido } = require('../controllers/pedidoController');

router.post('/', crearPedido);

module.exports = router;
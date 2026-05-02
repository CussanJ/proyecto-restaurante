const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    productoId: {
        type: String,
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Pedido', pedidoSchema);
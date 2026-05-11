const mongoose = require('mongoose');

const detallePedidoSchema = new mongoose.Schema({
    productoId: {
        type: String,
        required: true
    },
    nombre: String,
    precio: Number,
    cantidad: {
        type: Number,
        required: true
    }
}, { _id: false });

const pedidoSchema = new mongoose.Schema({
    items: [detallePedidoSchema],
    estado: {
        type: String,
        enum: ['pendiente', 'en preparación', 'en camino', 'entregado'],
        default: 'pendiente'
    },
    total: {
        type: Number,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    referencia: String,
    metodoPago: {
        type: String,
        enum: ['tarjeta', 'efectivo'],
        default: 'efectivo'
    },
    cliente: {
        nombre: String,
        telefono: String,
        email: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pedido', pedidoSchema);
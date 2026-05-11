const mongoose = require('mongoose');

const detalleSchema = new mongoose.Schema({
    productoId: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const ESTADOS_VALIDOS = ['pendiente', 'en preparacion', 'entregado', 'cancelado'];

const pedidoSchema = new mongoose.Schema({
    cliente: {
        type: String,
        required: true
    },
    detalle: {
        type: [detalleSchema],
        required: true,
        validate: {
            validator: arr => Array.isArray(arr) && arr.length > 0,
            message: 'El pedido debe tener al menos un item'
        }
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    estado: {
        type: String,
        enum: ESTADOS_VALIDOS,
        default: 'pendiente'
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pedido', pedidoSchema);
module.exports.ESTADOS_VALIDOS = ESTADOS_VALIDOS;

const mongoose = require('mongoose');

const detalleSchema = new mongoose.Schema({
    productoId: String,
    nombre: String,
    cantidad: Number,
    precio: Number
}, { _id: false });

const ESTADOS_VALIDOS = ['pendiente', 'en preparacion', 'entregado', 'cancelado'];

const pedidoSchema = new mongoose.Schema({
    cliente: {
        nombre: String,
        email: String,
        telefono: String
    },
    detalle: {
        type: [detalleSchema],
        required: true
    },
    total: Number,
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
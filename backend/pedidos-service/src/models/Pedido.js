const mongoose = require('mongoose');

<<<<<<< HEAD
const detallePedidoSchema = new mongoose.Schema({
=======
const detalleSchema = new mongoose.Schema({
>>>>>>> 7f929fad72b15e0440dea75533dd85950f0da28d
    productoId: {
        type: String,
        required: true
    },
<<<<<<< HEAD
    nombre: String,
    precio: Number,
=======
    nombre: {
        type: String,
        required: true
    },
>>>>>>> 7f929fad72b15e0440dea75533dd85950f0da28d
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
module.exports.ESTADOS_VALIDOS = ESTADOS_VALIDOS;

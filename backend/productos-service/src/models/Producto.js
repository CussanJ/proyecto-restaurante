const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    disponible: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Producto', productoSchema);
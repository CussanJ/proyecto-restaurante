const mongoose = require('mongoose');

const inventarioSchema = new mongoose.Schema({
    productoId: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Inventario', inventarioSchema);
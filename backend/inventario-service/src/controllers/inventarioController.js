const Inventario = require('../models/Inventario');

// Crear registro de inventario
const crearInventario = async (req, res) => {
    try {
        const inventario = new Inventario(req.body);
        await inventario.save();
        res.json(inventario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener inventario
const obtenerInventario = async (req, res) => {
    try {
        const inventario = await Inventario.find();
        res.json(inventario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    crearInventario,
    obtenerInventario
};
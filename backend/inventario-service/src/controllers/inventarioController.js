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

const actualizarStock = async (req, res) => {

    try {

        const { productoId, cantidad } = req.body;

        const item = await Inventario.findOne({ productoId });

        if (!item) {
            return res.status(404).json({
                mensaje: "Producto no encontrado en inventario"
            });
        }

        if (item.stock < cantidad) {
            return res.status(400).json({
                mensaje: "Stock insuficiente"
            });
        }

        item.stock -= cantidad;

        await item.save();

        res.json({
            mensaje: "Stock actualizado",
            item
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

const agregarStock = async (req, res) => {

    try {

        const { productoId, cantidad } = req.body;

        const item = await Inventario.findOne({ productoId });

        if (!item) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        item.stock += cantidad;

        await item.save();

        res.json({
            mensaje: "Stock agregado",
            item
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

module.exports = {
    crearInventario,
    obtenerInventario,
    actualizarStock,
    agregarStock
};
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

// Validar stock (sin decrementar)
const validarStock = async (req, res) => {
    try {
        const { productoId, cantidad } = req.body;

        if (!productoId || !cantidad) {
            return res.status(400).json({ error: 'productoId y cantidad son requeridos' });
        }

        const item = await Inventario.findOne({ productoId });

        if (!item) {
            return res.status(404).json({ error: 'Producto no encontrado en inventario' });
        }

        if (item.stock < cantidad) {
            return res.status(400).json({
                error: 'Stock insuficiente',
                disponible: item.stock,
                solicitado: cantidad
            });
        }

        res.json({
            mensaje: 'Stock disponible',
            productoId,
            disponible: item.stock,
            solicitado: cantidad
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar stock (decrementar)
const actualizarStock = async (req, res) => {
    try {
        const { productoId, cantidad } = req.body;

        if (!productoId || !cantidad) {
            return res.status(400).json({ error: 'productoId y cantidad son requeridos' });
        }

        const item = await Inventario.findOne({ productoId });

        if (!item) {
            return res.status(404).json({ error: 'Producto no encontrado en inventario' });
        }

        if (item.stock < cantidad) {
            return res.status(400).json({
                error: 'Stock insuficiente',
                disponible: item.stock,
                solicitado: cantidad
            });
        }

        item.stock -= cantidad;
        await item.save();

        res.json({
            mensaje: 'Stock actualizado',
            item
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    crearInventario,
    obtenerInventario,
    validarStock,
    actualizarStock
};
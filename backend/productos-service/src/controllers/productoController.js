const Producto = require('../models/Producto');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../../uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const crearProducto = async (req, res) => {
    try {
        const producto = new Producto(req.body);
        await producto.save();
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        await Producto.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const subirImagen = [
    upload.single('imagen'),
    (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' });
        res.json({ url: `http://localhost:${process.env.PORT}/uploads/${req.file.filename}` });
    },
];

module.exports = { crearProducto, obtenerProductos, actualizarProducto, eliminarProducto, subirImagen };

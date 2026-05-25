const mongoose = require('mongoose');

// ── Modelos inline para el seed ──────────────────────────────────────────────
const Producto = mongoose.model('Producto', new mongoose.Schema({
  nombre: String,
  precio: Number,
  disponible: { type: Boolean, default: true },
}));

const Inventario = mongoose.model('Inventario', new mongoose.Schema({
  productoId: String,
  stock: Number,
}));

const productos = [
  { nombre: 'Truffle King Burger',      precio: 18.50 },
  { nombre: 'Smoky Heat Burger',        precio: 16.00 },
  { nombre: 'Garden Beast Burger',      precio: 17.25 },
  { nombre: 'Bacon Tower',              precio: 21.00 },
  { nombre: 'Buffalo Margherita Pizza', precio: 14.00 },
  { nombre: 'Pepperoni Pizza XL',       precio: 15.50 },
  { nombre: 'Crispy Calamari',          precio: 13.00 },
  { nombre: 'Caesar Salad',             precio: 10.00 },
  { nombre: 'Rosemary Fries',           precio: 8.50  },
  { nombre: 'Botanical Soda',           precio: 4.50  },
  { nombre: 'Smoked Old Fashioned',     precio: 12.50 },
  { nombre: 'Garlic Knots',             precio: 6.00  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/productos_db');
  console.log('✅ Conectado a MongoDB');

  await Producto.deleteMany({});
  const insertados = await Producto.insertMany(productos);
  console.log(`✅ ${insertados.length} productos insertados`);

  // Conectar inventario_db y sembrar stock
  await mongoose.disconnect();
  await mongoose.connect(process.env.MONGODB_URI_INVENTARIO || 'mongodb://127.0.0.1:27017/inventario_db');

  const InventarioModel = mongoose.model('Inventario', new mongoose.Schema({
    productoId: String,
    stock: Number,
  }));

  await InventarioModel.deleteMany({});
  const inventario = insertados.map((p, i) => ({
    productoId: p._id.toString(),
    stock: [2, 15, 45, 30, 25, 20, 12, 40, 50, 100, 18, 35][i] ?? 20,
  }));
  await InventarioModel.insertMany(inventario);
  console.log(`✅ Inventario sembrado para ${inventario.length} productos`);

  await mongoose.disconnect();
  console.log('✅ Seed completo. Listo para usar.');
}

seed().catch(err => { console.error('❌ Error:', err); process.exit(1); });

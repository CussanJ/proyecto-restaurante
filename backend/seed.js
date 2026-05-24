const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre:      String,
  precio:      Number,
  categoria:   { type: String, default: 'General' },
  descripcion: { type: String, default: '' },
  imagen:      { type: String, default: '' },
  disponible:  { type: Boolean, default: true },
});

const Producto = mongoose.model('Producto', productoSchema);

const productos = [
  {
    nombre: 'Truffle King Burger', precio: 18.50, categoria: 'Burgers',
    descripcion: 'Burger gourmet con trufa negra, queso brie y cebolla caramelizada.',
    imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
  },
  {
    nombre: 'Smoky Heat Burger', precio: 16.00, categoria: 'Burgers',
    descripcion: 'Burger ahumada con jalapeños, salsa chipotle y queso cheddar.',
    imagen: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80',
  },
  {
    nombre: 'Garden Beast Burger', precio: 17.25, categoria: 'Burgers',
    descripcion: 'Burger vegana con carne de planta, aguacate y ensalada fresca.',
    imagen: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80',
  },
  {
    nombre: 'Bacon Tower', precio: 21.00, categoria: 'Burgers',
    descripcion: 'Doble carne, triple tocino, queso americano y salsa especial de la casa.',
    imagen: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80',
  },
  {
    nombre: 'Buffalo Margherita Pizza', precio: 14.00, categoria: 'Pizzas',
    descripcion: 'Pizza margarita con salsa buffalo, mozzarella fresca y albahaca.',
    imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
  },
  {
    nombre: 'Pepperoni Pizza XL', precio: 15.50, categoria: 'Pizzas',
    descripcion: 'Pizza extragrande con doble pepperoni y queso italiano gratinado.',
    imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
  },
  {
    nombre: 'Crispy Calamari', precio: 13.00, categoria: 'Acompañados',
    descripcion: 'Calamares fritos crujientes con salsa tártara y limón fresco.',
    imagen: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80',
  },
  {
    nombre: 'Caesar Salad', precio: 10.00, categoria: 'Acompañados',
    descripcion: 'Ensalada César clásica con crutones, parmesano y aderezo artesanal.',
    imagen: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80',
  },
  {
    nombre: 'Rosemary Fries', precio: 8.50, categoria: 'Acompañados',
    descripcion: 'Papas fritas con romero fresco, ajo confitado y sal de mar.',
    imagen: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80',
  },
  {
    nombre: 'Botanical Soda', precio: 4.50, categoria: 'Bebidas',
    descripcion: 'Refresco artesanal con extractos botánicos y agua mineral gasificada.',
    imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
  },
  {
    nombre: 'Smoked Old Fashioned', precio: 12.50, categoria: 'Bebidas',
    descripcion: 'Cóctel clásico ahumado con whiskey bourbon y bitters de naranja.',
    imagen: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80',
  },
  {
    nombre: 'Garlic Knots', precio: 6.00, categoria: 'Acompañados',
    descripcion: 'Panecillos de ajo horneados con mantequilla y perejil fresco.',
    imagen: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7f?w=400&q=80',
  },
];

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/productos_db');
  console.log('✅ Conectado a productos_db');

  await Producto.deleteMany({});
  const insertados = await Producto.insertMany(productos);
  console.log(`✅ ${insertados.length} productos insertados`);

  await mongoose.disconnect();
  await mongoose.connect('mongodb://127.0.0.1:27017/inventario_db');

  const Inventario = mongoose.model('Inventario', new mongoose.Schema({
    productoId: String,
    stock: Number,
  }));

  await Inventario.deleteMany({});
  const stocks = [2, 15, 45, 30, 25, 20, 12, 40, 50, 100, 18, 35];
  const inventario = insertados.map((p, i) => ({
    productoId: p._id.toString(),
    stock: stocks[i] ?? 20,
  }));
  await Inventario.insertMany(inventario);
  console.log(`✅ Inventario sembrado para ${inventario.length} productos`);

  await mongoose.disconnect();
  console.log('✅ Seed completo. Listo para usar.');
}

seed().catch(err => { console.error('❌ Error:', err); process.exit(1); });

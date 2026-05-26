const productoRoutes = require('./routes/productoRoutes');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/productos', productoRoutes);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/productos_db')
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Servicio productos funcionando');
});

const puerto = process.env.PORT || 3001;

app.listen(puerto, () => {
    console.log(`Servidor en puerto ${puerto}`);
});
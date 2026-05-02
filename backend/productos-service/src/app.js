const productoRoutes = require('./routes/productoRoutes');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/productos', productoRoutes);

mongoose.connect('mongodb://127.0.0.1:27017/productos_db')
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Servicio productos funcionando');
});

app.listen(3001, () => {
    console.log('Servidor en puerto 3001');
});
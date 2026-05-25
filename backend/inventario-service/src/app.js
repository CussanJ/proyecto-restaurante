const inventarioRoutes = require('./routes/inventarioRoutes');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/inventario', inventarioRoutes);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inventario_db')
    .then(() => console.log('MongoDB inventario conectado'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Servicio inventario funcionando');
});

app.listen(3002, () => {
    console.log('Servidor inventario en puerto 3002');
});
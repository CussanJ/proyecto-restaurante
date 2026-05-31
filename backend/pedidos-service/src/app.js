const pedidoRoutes = require('./routes/pedidoRoutes');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/pedidos', pedidoRoutes);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pedidos_db')
    .then(() => console.log('MongoDB pedidos conectado'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Servicio pedidos funcionando');
});

app.listen(process.env.PORT || 3003, () => {
    console.log('Servidor pedidos en puerto 3003');
});
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado — auth_db'))
  .catch(err => console.error('Error MongoDB:', err));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Auth service corriendo en puerto ${PORT}`));

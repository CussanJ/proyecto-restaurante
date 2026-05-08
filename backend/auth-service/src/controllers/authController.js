const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const ResetToken = require('../models/ResetToken');
const { enviarEmailRecuperacion } = require('../services/emailService');

const generarToken = (admin) =>
  jwt.sign(
    { id: admin._id, email: admin.email, nombre: admin.nombre },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password)
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });

    const existe = await Admin.findOne({ email });
    if (existe)
      return res.status(400).json({ error: 'Ya existe una cuenta con ese correo.' });

    const hash = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ nombre, email, password: hash });
    const token = generarToken(admin);

    res.status(201).json({ token, admin: { nombre: admin.nombre, email: admin.email } });
  } catch (err) {
    console.error('Error registro:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });

    const valido = await bcrypt.compare(password, admin.password);
    if (!valido)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });

    const token = generarToken(admin);
    res.json({ token, admin: { nombre: admin.nombre, email: admin.email } });
  } catch (err) {
    console.error('Error login:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const recuperar = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ error: 'El correo es requerido.' });

    console.log('🔍 Recuperar contraseña para:', email);

    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log('⚠️  Correo NO encontrado en la base de datos:', email);
      return res.json({ mensaje: 'Si el correo está registrado, recibirás las instrucciones en breve.' });
    }

    console.log('✅ Admin encontrado:', admin.nombre, '— enviando correo...');

    await ResetToken.deleteMany({ email });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await ResetToken.create({ email, token, expiresAt });
    await enviarEmailRecuperacion(email, token);

    console.log('📧 Correo de recuperación enviado a:', email);
    res.json({ mensaje: 'Si el correo está registrado, recibirás las instrucciones en breve.' });
  } catch (err) {
    console.error('❌ Error recuperar:', err.message);
    res.status(500).json({ error: 'No se pudo enviar el correo. Verifica la configuración del email.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password)
      return res.status(400).json({ error: 'Token y contraseña son requeridos.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });

    const registro = await ResetToken.findOne({ token });

    if (!registro || registro.expiresAt < new Date()) {
      await ResetToken.deleteOne({ token });
      return res.status(400).json({ error: 'El enlace es inválido o ha expirado. Solicita uno nuevo.' });
    }

    const hash = await bcrypt.hash(password, 12);
    await Admin.findOneAndUpdate({ email: registro.email }, { password: hash });
    await ResetToken.deleteOne({ token });

    res.json({ mensaje: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
  } catch (err) {
    console.error('Error resetPassword:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const verificarToken = (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Sin token.' });

  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valido: true, admin: { nombre: decoded.nombre, email: decoded.email } });
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

module.exports = { registro, login, recuperar, resetPassword, verificarToken };

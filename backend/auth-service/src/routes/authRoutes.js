const express = require('express');
const router = express.Router();
const {
  registro,
  login,
  recuperar,
  resetPassword,
  verificarToken,
} = require('../controllers/authController');

router.post('/registro',       registro);
router.post('/login',          login);
router.post('/recuperar',      recuperar);
router.post('/reset-password', resetPassword);
router.get('/verificar',       verificarToken);

module.exports = router;

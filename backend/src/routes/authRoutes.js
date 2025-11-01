const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rotas de autenticação de usuário
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;


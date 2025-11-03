const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { auth, authorize  } = require('../middlewares/auth');

/**
 * @route POST /api/auth/login
 * @desc Login de usuário do sistema
 * @access Public
 */
router.post('/login', AuthController.login);

/**
 * @route POST /api/auth/login-paciente
 * @desc Login de paciente (CPF e data de nascimento)
 * @access Public
 */
router.post('/login-paciente', AuthController.loginPaciente);

/**
 * @route POST /api/auth/register
 * @desc Registrar novo usuário do sistema (apenas admin)
 * @access Private (Admin)
 */
router.post('/register', auth, authorize('ADMINISTRADOR'), AuthController.register);


/**
 * @route GET /api/auth/me
 * @desc Retorna dados do usuário logado
 * @access Private
 */
router.get('/me', auth, AuthController.me);

/**
 * @route PUT /api/auth/change-password
 * @desc Alterar senha do usuário
 * @access Private
 */
router.put('/change-password', auth, AuthController.changePassword);

/**
 * @route POST /api/auth/logout
 * @desc Logout do usuário
 * @access Private
 */
router.post('/logout', auth, AuthController.logout);

/**
 * @route GET /api/auth/verify
 * @desc Verificar se token é válido
 * @access Private
 */
router.get('/verify', auth, AuthController.verifyToken);

module.exports = router;

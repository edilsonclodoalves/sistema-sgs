const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { auth } = require('../middlewares/auth');

/**
 * @route POST /api/auth/login
 * @desc Login de usuário
 * @access Public
 */
router.post('/login', AuthController.login);

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

const express = require('express');
const router = express.Router();
const medicoController = require('../controllers/medicoController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');

// Rotas públicas
router.get('/', medicoController.listarMedicos);
router.get('/:id', medicoController.obterMedico);

// Rotas protegidas
router.post('/', authMiddleware, checkRole(['admin']), medicoController.criarMedico);
router.put('/:id', authMiddleware, checkRole(['admin', 'medico']), medicoController.atualizarMedico);
router.patch('/:id', authMiddleware, checkRole(['admin', 'medico']), medicoController.atualizarParcialMedico);
router.delete('/:id', authMiddleware, checkRole(['admin']), medicoController.excluirMedico);

module.exports = router;


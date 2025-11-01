const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');

// Rotas públicas
router.get('/', pacienteController.listarPacientes);
router.get('/:id', pacienteController.obterPaciente);

// Rotas protegidas
router.post('/', authMiddleware, pacienteController.criarPaciente);
router.put('/:id', authMiddleware, pacienteController.atualizarPaciente);
router.patch('/:id', authMiddleware, pacienteController.atualizarParcialPaciente);
router.delete('/:id', authMiddleware, checkRole(['admin']), pacienteController.excluirPaciente);

module.exports = router;


const express = require('express');
const router = express.Router();
const prontuarioController = require('../controllers/prontuarioController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');

// Todas as rotas de prontuários são protegidas
router.get('/', authMiddleware, checkRole(['admin', 'medico']), prontuarioController.listarProntuarios);
router.get('/:id', authMiddleware, prontuarioController.obterProntuariodoPaciente);
router.get('/paciente/:id', authMiddleware, prontuarioController.obterProntuariodoPaciente);
router.post('/', authMiddleware, checkRole(['admin', 'medico']), prontuarioController.criarProntuario);
router.put('/:id', authMiddleware, checkRole(['admin', 'medico']), prontuarioController.atualizarProntuario);
router.delete('/:id', authMiddleware, checkRole(['admin']), prontuarioController.excluirProntuario);

module.exports = router;


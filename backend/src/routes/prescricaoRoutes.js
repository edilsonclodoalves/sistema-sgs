const express = require('express');
const router = express.Router();
const prescricaoController = require('../controllers/prescricaoController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');

// Todas as rotas de prescrições são protegidas
router.get('/', authMiddleware, prescricaoController.listarPrescricoes);
router.get('/:id', authMiddleware, prescricaoController.obterPrescricao);
router.post('/', authMiddleware, checkRole(['admin', 'medico']), prescricaoController.criarPrescricao);
router.put('/:id', authMiddleware, checkRole(['admin', 'medico']), prescricaoController.atualizarPrescricao);
router.patch('/:id', authMiddleware, checkRole(['admin', 'medico']), prescricaoController.atualizarParcialPrescricao);
router.delete('/:id', authMiddleware, checkRole(['admin']), prescricaoController.excluirPrescricao);

module.exports = router;


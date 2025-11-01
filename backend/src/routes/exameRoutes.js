const express = require('express');
const router = express.Router();
const exameController = require('../controllers/exameController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');

// Todas as rotas de exames são protegidas
router.get('/', authMiddleware, exameController.listarExames);
router.get('/:id', authMiddleware, exameController.obterExame);
router.post('/', authMiddleware, checkRole(['admin', 'medico']), exameController.criarExame);
router.put('/:id', authMiddleware, checkRole(['admin', 'medico']), exameController.atualizarExame);
router.patch('/:id', authMiddleware, checkRole(['admin', 'medico']), exameController.atualizarParcialExame);
router.delete('/:id', authMiddleware, checkRole(['admin']), exameController.excluirExame);

module.exports = router;


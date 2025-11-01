const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultaController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');

// Rotas protegidas
router.get('/', authMiddleware, consultaController.listarConsultas);
router.get('/:id', authMiddleware, consultaController.obterConsulta);
router.post('/', authMiddleware, consultaController.criarConsulta);
router.put('/:id', authMiddleware, consultaController.atualizarConsulta);
router.patch('/:id', authMiddleware, consultaController.atualizarParcialConsulta);
router.delete('/:id', authMiddleware, checkRole(['admin', 'medico']), consultaController.excluirConsulta);

module.exports = router;


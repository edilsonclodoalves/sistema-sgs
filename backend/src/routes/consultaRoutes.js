const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultaController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Rotas protegidas
router.get('/', authMiddleware, consultaController.listarConsultas);
router.get('/horarios-disponiveis', consultaController.listarHorariosDisponiveis);
router.get('/status/:status', authMiddleware, consultaController.listarPorStatus);
router.get('/:id', authMiddleware, consultaController.buscarConsulta);
router.post('/', authMiddleware, consultaController.agendarConsulta);
router.put('/:id', authMiddleware, consultaController.atualizarConsulta);
router.delete('/:id', authMiddleware, consultaController.cancelarConsulta);

module.exports = router;


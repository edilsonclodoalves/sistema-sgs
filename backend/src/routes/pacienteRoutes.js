const express = require('express');
const router = express.Router();
const PacienteController = require('../controllers/PacienteController');
const { auth, authorize } = require('../middlewares/auth');

// Rotas de pacientes
router.get('/:id/historico', auth, PacienteController.historico);
router.get('/:id', auth, PacienteController.show);
router.get('/', auth, PacienteController.index);
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO'), PacienteController.store);
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), PacienteController.update);
router.delete('/:id', auth, authorize('ADMINISTRADOR'), PacienteController.destroy);

module.exports = router;

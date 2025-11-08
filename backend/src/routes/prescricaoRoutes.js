const express = require('express');
const router = express.Router();
const PrescricaoController = require('../controllers/PrescricaoController');
const { auth, authorize } = require('../middlewares/auth');

// Rotas de prescrições
router.get('/paciente/:paciente_id', auth, PrescricaoController.prescricoesPaciente);
router.get('/:id', auth, PrescricaoController.show);
router.get('/', auth, PrescricaoController.index);
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO'), PrescricaoController.store);
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), PrescricaoController.update);
router.delete('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), PrescricaoController.destroy);

module.exports = router;

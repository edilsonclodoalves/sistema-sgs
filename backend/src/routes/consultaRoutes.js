const express = require('express');
const router = express.Router();
const ConsultaController = require('../controllers/ConsultaController');
const { auth, authorize } = require('../middlewares/auth');

router.get('/paciente/:paciente_id', auth, ConsultaController.byPaciente);
router.get('/:id', auth, ConsultaController.show);

router.get('/', auth, ConsultaController.index);
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'), ConsultaController.store);
router.put('/:id/cancelar', auth, authorize('ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'), ConsultaController.cancelar);
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'), ConsultaController.update);

module.exports = router;

const express = require('express');
const router = express.Router();
const ConsultaController = require('../controllers/ConsultaController');
const { auth, authorize } = require('../middlewares/auth');

router.get('/', auth, ConsultaController.index);
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA'), ConsultaController.store);
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA'), ConsultaController.update);
router.put('/:id/cancelar', auth, authorize('ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'), ConsultaController.cancelar);

module.exports = router;

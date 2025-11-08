const express = require('express');
const router = express.Router();
const ProntuarioController = require('../controllers/ProntuarioController');
const { auth, authorize } = require('../middlewares/auth');

// Rotas de prontuários
router.get('/paciente/:paciente_id', auth, ProntuarioController.historicoPaciente);
router.get('/:id', auth, ProntuarioController.show);
router.get('/', auth, ProntuarioController.index);
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO'), ProntuarioController.store);
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), ProntuarioController.update);
router.delete('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), ProntuarioController.destroy);

module.exports = router;

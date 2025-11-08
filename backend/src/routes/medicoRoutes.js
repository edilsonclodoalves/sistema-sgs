const express = require('express');
const router = express.Router();
const MedicoController = require('../controllers/MedicoController');
const { auth, authorize } = require('../middlewares/auth');

// Rotas de médicos
router.get('/especialidades', auth, MedicoController.especialidades);
router.get('/:id/agenda', auth, MedicoController.agenda);
router.get('/:id', auth, MedicoController.show);
router.get('/', auth, MedicoController.index);
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO'), MedicoController.store);
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), MedicoController.update);
router.delete('/:id', auth, authorize('ADMINISTRADOR'), MedicoController.destroy);

module.exports = router;

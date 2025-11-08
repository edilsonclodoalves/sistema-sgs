const express = require('express');
const router = express.Router();
const ExameController = require('../controllers/ExameController');
const { auth, authorize } = require('../middlewares/auth');

// Rotas de exames
router.get('/tipos', auth, ExameController.tipos);
router.get('/:id', auth, ExameController.show);
router.get('/', auth, ExameController.index);
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO'), ExameController.store);
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), ExameController.update);
router.patch('/:id/status', auth, authorize('ADMINISTRADOR', 'MEDICO'), ExameController.updateStatus);
router.delete('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), ExameController.destroy);

module.exports = router;

const express = require('express');
const router = express.Router();
const PrescricaoController = require('../controllers/PrescricaoController');
const { auth, authorize } = require('../middlewares/auth');

// Rotas de prescrições
// IMPORTANTE: Rotas específicas devem vir ANTES das rotas genéricas com parâmetros

// Rota específica para listar todas (deve vir antes de /:id)
router.get('/', auth, PrescricaoController.index);

// Rota específica para buscar prescrições de um paciente
router.get('/paciente/:paciente_id', auth, PrescricaoController.prescricoesPaciente);

// Rota genérica com parâmetro (deve vir por último entre os GETs)
router.get('/:id', auth, PrescricaoController.show);

// Rotas de modificação
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO'), PrescricaoController.store);
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), PrescricaoController.update);
router.delete('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), PrescricaoController.destroy);

module.exports = router;
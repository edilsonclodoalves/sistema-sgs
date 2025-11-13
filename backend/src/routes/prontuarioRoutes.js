const express = require('express');
const router = express.Router();
const ProntuarioController = require('../controllers/ProntuarioController');
const { auth, authorize } = require('../middlewares/auth');

/**
 * @route GET /api/prontuario/paciente/:paciente_id
 * @desc Listar histórico de prontuários do paciente
 * @access Private
 */
router.get('/paciente/:paciente_id', auth, ProntuarioController.historicoPaciente);

/**
 * @route GET /api/prontuario/:id
 * @desc Mostrar prontuário específico
 * @access Private
 */
router.get('/:id', auth, ProntuarioController.show);

/**
 * @route GET /api/prontuario
 * @desc Listar todos os prontuários
 * @access Private
 */
router.get('/', auth, ProntuarioController.index);

/**
 * @route POST /api/prontuario
 * @desc Criar novo prontuário
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO'), ProntuarioController.store);

/**
 * @route PUT /api/prontuario/:id
 * @desc Atualizar prontuário
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), ProntuarioController.update);

/**
 * @route DELETE /api/prontuario/:id
 * @desc Deletar prontuário
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.delete('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), ProntuarioController.destroy);

module.exports = router;
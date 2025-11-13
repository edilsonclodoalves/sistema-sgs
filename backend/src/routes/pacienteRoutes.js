const express = require('express');
const router = express.Router();
const PacienteController = require('../controllers/PacienteController');
const { auth, authorize } = require('../middlewares/auth');

/**
 * @route GET /api/paciente/:id/historico
 * @desc Listar histórico do paciente
 * @access Private
 */
router.get('/:id/historico', auth, PacienteController.historico);

/**
 * @route GET /api/paciente/:id
 * @desc Mostrar paciente específico
 * @access Private
 */
router.get('/:id', auth, PacienteController.show);

/**
 * @route GET /api/paciente
 * @desc Listar todos os pacientes
 * @access Private
 */
router.get('/', auth, PacienteController.index);

/**
 * @route POST /api/paciente
 * @desc Criar novo paciente
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO'), PacienteController.store);

/**
 * @route PUT /api/paciente/:id
 * @desc Atualizar paciente
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), PacienteController.update);

/**
 * @route DELETE /api/paciente/:id
 * @desc Deletar paciente
 * @access Private (ADMINISTRADOR)
 */
router.delete('/:id', auth, authorize('ADMINISTRADOR'), PacienteController.destroy);

module.exports = router;
const express = require('express');
const router = express.Router();
const ConsultaController = require('../controllers/ConsultaController');
const { auth, authorize } = require('../middlewares/auth');

/**
 * @route GET /api/consulta/paciente/:paciente_id
 * @desc Listar consultas por paciente
 * @access Private
 */
router.get('/paciente/:paciente_id', auth, ConsultaController.byPaciente);

/**
 * @route GET /api/consulta/:id
 * @desc Mostrar consulta específica
 * @access Private
 */
router.get('/:id', auth, ConsultaController.show);

/**
 * @route GET /api/consulta
 * @desc Listar todas as consultas
 * @access Private
 */
router.get('/', auth, ConsultaController.index);

/**
 * @route POST /api/consulta
 * @desc Criar nova consulta
 * @access Private (ADMINISTRADOR, MEDICO, RECEPCIONISTA, PACIENTE)
 */
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'), ConsultaController.store);

/**
 * @route PUT /api/consulta/:id/cancelar
 * @desc Cancelar consulta
 * @access Private (ADMINISTRADOR, MEDICO, RECEPCIONISTA, PACIENTE)
 */
router.put('/:id/cancelar', auth, authorize('ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'), ConsultaController.cancelar);

/**
 * @route PUT /api/consulta/:id
 * @desc Atualizar consulta
 * @access Private (ADMINISTRADOR, MEDICO, RECEPCIONISTA, PACIENTE)
 */
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'), ConsultaController.update);

module.exports = router;
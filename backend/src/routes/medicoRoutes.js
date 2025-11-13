const express = require('express');
const router = express.Router();
const MedicoController = require('../controllers/MedicoController');
const { auth, authorize } = require('../middlewares/auth');

/**
 * @route GET /api/medico/especialidades
 * @desc Listar especialidades de médicos
 * @access Private
 */
router.get('/especialidades', auth, MedicoController.especialidades);

/**
 * @route GET /api/medico/:id/agenda
 * @desc Mostrar agenda do médico
 * @access Private
 */
router.get('/:id/agenda', auth, MedicoController.agenda);

/**
 * @route GET /api/medico/:id
 * @desc Mostrar médico específico
 * @access Private
 */
router.get('/:id', auth, MedicoController.show);

/**
 * @route GET /api/medico
 * @desc Listar todos os médicos
 * @access Private
 */
router.get('/', auth, MedicoController.index);

/**
 * @route POST /api/medico
 * @desc Criar novo médico
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO'), MedicoController.store);

/**
 * @route PUT /api/medico/:id
 * @desc Atualizar médico
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), MedicoController.update);

/**
 * @route DELETE /api/medico/:id
 * @desc Deletar médico
 * @access Private (ADMINISTRADOR)
 */
router.delete('/:id', auth, authorize('ADMINISTRADOR'), MedicoController.destroy);

module.exports = router;
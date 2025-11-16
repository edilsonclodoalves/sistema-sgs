const express = require('express');
const router = express.Router();
const ExameController = require('../controllers/ExameController');
const { auth, authorize } = require('../middlewares/auth');

/**
 * @route GET /api/exames/paciente/:paciente_id
 * @desc Listar exames por paciente
 * @access Private
 */
router.get('/paciente/:paciente_id', auth, ExameController.examesPaciente);

/**
 * @route GET /api/exame/tipos
 * @desc Listar tipos de exames
 * @access Private
 */
router.get('/tipos', auth, ExameController.tipos);

/**
 * @route GET /api/exame/:id
 * @desc Mostrar exame específico
 * @access Private
 */
router.get('/:id', auth, ExameController.show);

/**
 * @route GET /api/exame
 * @desc Listar todos os exames
 * @access Private
 */
router.get('/', auth, ExameController.index);

/**
 * @route POST /api/exame
 * @desc Criar novo exame
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO'), ExameController.store);

/**
 * @route PUT /api/exame/:id
 * @desc Atualizar exame
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), ExameController.update);

/**
 * @route PATCH /api/exame/:id/status
 * @desc Atualizar status do exame
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.patch('/:id/status', auth, authorize('ADMINISTRADOR', 'MEDICO'), ExameController.updateStatus);

/**
 * @route DELETE /api/exame/:id
 * @desc Deletar exame
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.delete('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), ExameController.destroy);

module.exports = router;
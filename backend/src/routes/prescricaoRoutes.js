const express = require('express');
const router = express.Router();
const PrescricaoController = require('../controllers/PrescricaoController');
const { auth, authorize } = require('../middlewares/auth');

/**
 * @route GET /api/prescricao/paciente/:paciente_id
 * @desc Listar prescrições por paciente
 * @access Private
 */
router.get('/paciente/:paciente_id', auth, PrescricaoController.prescricoesPaciente);

/**
 * @route GET /api/prescricao/:id
 * @desc Mostrar prescrição específica
 * @access Private
 */
router.get('/:id', auth, PrescricaoController.show);

/**
 * @route GET /api/prescricao
 * @desc Listar todas as prescrições
 * @access Private
 */
router.get('/', auth, PrescricaoController.index);

/**
 * @route POST /api/prescricao
 * @desc Criar nova prescrição
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO'), PrescricaoController.store);

/**
 * @route PUT /api/prescricao/:id
 * @desc Atualizar prescrição
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), PrescricaoController.update);

/**
 * @route DELETE /api/prescricao/:id
 * @desc Deletar prescrição
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.delete('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), PrescricaoController.destroy);

module.exports = router;
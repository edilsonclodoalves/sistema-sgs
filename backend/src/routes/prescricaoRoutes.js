const express = require('express');
const router = express.Router();
const PrescricaoController = require('../controllers/PrescricaoController');
const { auth, authorize } = require('../middlewares/auth');

/**
 * ====================================================================
 * ORDEM CORRETA DAS ROTAS:
 * 1. Rotas mais específicas PRIMEIRO (ex: /paciente/:id)
 * 2. Rotas com parâmetros dinâmicos DEPOIS (ex: /:id)
 * 3. Rotas genéricas por último (ex: /)
 * ====================================================================
 */

/**
 * @route GET /api/prescricoes/paciente/:paciente_id
 * @desc Listar prescrições por paciente
 * @access Private
 */
router.get('/paciente/:paciente_id', auth, PrescricaoController.prescricoesPaciente);

/**
 * @route POST /api/prescricoes
 * @desc Criar nova prescrição
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.post('/', auth, authorize('ADMINISTRADOR', 'MEDICO'), PrescricaoController.store);

/**
 * @route GET /api/prescricoes
 * @desc Listar todas as prescrições
 * @access Private
 */
router.get('/', auth, PrescricaoController.index);

/**
 * @route GET /api/prescricoes/:id
 * @desc Mostrar prescrição específica
 * @access Private
 * @note Esta rota DEVE vir DEPOIS de rotas mais específicas como /paciente/:id
 */
router.get('/:id', auth, PrescricaoController.show);

/**
 * @route PUT /api/prescricoes/:id
 * @desc Atualizar prescrição
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.put('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), PrescricaoController.update);

/**
 * @route DELETE /api/prescricoes/:id
 * @desc Deletar prescrição
 * @access Private (ADMINISTRADOR, MEDICO)
 */
router.delete('/:id', auth, authorize('ADMINISTRADOR', 'MEDICO'), PrescricaoController.destroy);

module.exports = router;
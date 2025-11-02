const express = require('express');
const router = express.Router();
const PacienteController = require('../controllers/PacienteController');
const { auth, authorize } = require('../middlewares/auth');

/**
 * @route GET /api/pacientes
 * @desc Listar todos os pacientes
 * @access Private (ADMINISTRADOR, MEDICO, RECEPCIONISTA)
 */
router.get('/', 
  auth, 
  authorize('ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA'),
  PacienteController.index
);

/**
 * @route GET /api/pacientes/:id
 * @desc Buscar paciente por ID
 * @access Private (ADMINISTRADOR, MEDICO, RECEPCIONISTA, próprio PACIENTE)
 */
router.get('/:id', 
  auth,
  PacienteController.show
);

/**
 * @route POST /api/pacientes
 * @desc Criar novo paciente
 * @access Private (ADMINISTRADOR, RECEPCIONISTA)
 */
router.post('/',
  auth,
  authorize('ADMINISTRADOR', 'RECEPCIONISTA'),
  PacienteController.store
);

/**
 * @route PUT /api/pacientes/:id
 * @desc Atualizar paciente
 * @access Private (ADMINISTRADOR, RECEPCIONISTA)
 */
router.put('/:id',
  auth,
  authorize('ADMINISTRADOR', 'RECEPCIONISTA'),
  PacienteController.update
);

/**
 * @route DELETE /api/pacientes/:id
 * @desc Desativar paciente
 * @access Private (ADMINISTRADOR)
 */
router.delete('/:id',
  auth,
  authorize('ADMINISTRADOR'),
  PacienteController.destroy
);

/**
 * @route GET /api/pacientes/:id/historico
 * @desc Histórico médico do paciente
 * @access Private (ADMINISTRADOR, MEDICO, próprio PACIENTE)
 */
router.get('/:id/historico',
  auth,
  authorize('ADMINISTRADOR', 'MEDICO', 'PACIENTE'),
  PacienteController.historico
);

module.exports = router;

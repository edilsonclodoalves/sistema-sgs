const express = require('express');
const router = express.Router();
const { Prontuario, Consulta, Paciente, Medico, Pessoa, Prescricao } = require('../models');
const { auth, authorize } = require('../middlewares/auth');

// Listar prontuários
router.get('/', auth, authorize('ADMINISTRADOR', 'MEDICO'), async (req, res) => {
  try {
    const { page = 1, limit = 10, paciente_id, medico_id } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (paciente_id) where.paciente_id = paciente_id;
    if (medico_id) where.medico_id = medico_id;

    const { count, rows: prontuarios } = await Prontuario.findAndCountAll({
      where,
      include: [
        {
          model: Paciente,
          as: 'paciente',
          include: [{ model: Pessoa, as: 'pessoa' }]
        },
        {
          model: Medico,
          as: 'medico',
          include: [{ model: Pessoa, as: 'pessoa' }]
        },
        {
          model: Consulta,
          as: 'consulta'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      prontuarios,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Buscar prontuário por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const prontuario = await Prontuario.findByPk(req.params.id, {
      include: [
        {
          model: Paciente,
          as: 'paciente',
          include: [{ model: Pessoa, as: 'pessoa' }]
        },
        {
          model: Medico,
          as: 'medico',
          include: [{ model: Pessoa, as: 'pessoa' }]
        },
        {
          model: Consulta,
          as: 'consulta'
        },
        {
          model: Prescricao,
          as: 'prescricoes'
        }
      ]
    });

    if (!prontuario) {
      return res.status(404).json({ error: 'Prontuário não encontrado' });
    }

    return res.json({ prontuario });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Criar prontuário
router.post('/', auth, authorize('MEDICO', 'ADMINISTRADOR'), async (req, res) => {
  try {
    const {
      consulta_id, paciente_id, medico_id,
      queixa_principal, historia_doenca, exame_fisico,
      diagnostico, cid, conduta, observacoes
    } = req.body;

    if (!consulta_id || !paciente_id || !medico_id) {
      return res.status(400).json({
        error: 'Consulta, paciente e médico são obrigatórios'
      });
    }

    const prontuario = await Prontuario.create({
      consulta_id, paciente_id, medico_id,
      queixa_principal, historia_doenca, exame_fisico,
      diagnostico, cid, conduta, observacoes
    });

    const prontuarioCriado = await Prontuario.findByPk(prontuario.id, {
      include: [
        {
          model: Paciente,
          as: 'paciente',
          include: [{ model: Pessoa, as: 'pessoa' }]
        },
        {
          model: Medico,
          as: 'medico',
          include: [{ model: Pessoa, as: 'pessoa' }]
        }
      ]
    });

    return res.status(201).json({
      message: 'Prontuário criado com sucesso',
      prontuario: prontuarioCriado
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Atualizar prontuário
router.put('/:id', auth, authorize('MEDICO', 'ADMINISTRADOR'), async (req, res) => {
  try {
    const prontuario = await Prontuario.findByPk(req.params.id);

    if (!prontuario) {
      return res.status(404).json({ error: 'Prontuário não encontrado' });
    }

    await prontuario.update(req.body);

    const prontuarioAtualizado = await Prontuario.findByPk(req.params.id, {
      include: [
        {
          model: Paciente,
          as: 'paciente',
          include: [{ model: Pessoa, as: 'pessoa' }]
        },
        {
          model: Medico,
          as: 'medico',
          include: [{ model: Pessoa, as: 'pessoa' }]
        }
      ]
    });

    return res.json({
      message: 'Prontuário atualizado',
      prontuario: prontuarioAtualizado
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Prontuários do paciente
router.get('/paciente/:paciente_id', auth, async (req, res) => {
  try {
    const prontuarios = await Prontuario.findAll({
      where: { paciente_id: req.params.paciente_id },
      include: [
        {
          model: Medico,
          as: 'medico',
          include: [{ model: Pessoa, as: 'pessoa' }]
        },
        {
          model: Consulta,
          as: 'consulta'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ prontuarios });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Exame, Paciente, Medico, Pessoa } = require('../models');
const { auth, authorize } = require('../middlewares/auth');

// Listar exames
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, paciente_id, medico_id, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (paciente_id) where.paciente_id = paciente_id;
    if (medico_id) where.medico_solicitante_id = medico_id;
    if (status) where.status = status;

    const { count, rows: exames } = await Exame.findAndCountAll({
      where,
      include: [
        {
          model: Paciente,
          as: 'paciente',
          include: [{ model: Pessoa, as: 'pessoa' }]
        },
        {
          model: Medico,
          as: 'medico_solicitante',
          include: [{ model: Pessoa, as: 'pessoa' }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data_solicitacao', 'DESC']]
    });

    return res.json({
      exames,
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

// Buscar exame por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const exame = await Exame.findByPk(req.params.id, {
      include: [
        {
          model: Paciente,
          as: 'paciente',
          include: [{ model: Pessoa, as: 'pessoa' }]
        },
        {
          model: Medico,
          as: 'medico_solicitante',
          include: [{ model: Pessoa, as: 'pessoa' }]
        }
      ]
    });

    if (!exame) {
      return res.status(404).json({ error: 'Exame não encontrado' });
    }

    return res.json({ exame });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Solicitar exame
router.post('/', auth, authorize('MEDICO', 'ADMINISTRADOR'), async (req, res) => {
  try {
    const {
      paciente_id, medico_solicitante_id, tipo_exame,
      observacoes
    } = req.body;

    if (!paciente_id || !medico_solicitante_id || !tipo_exame) {
      return res.status(400).json({
        error: 'Paciente, médico e tipo de exame são obrigatórios'
      });
    }

    const exame = await Exame.create({
      paciente_id,
      medico_solicitante_id,
      tipo_exame,
      observacoes,
      data_solicitacao: new Date(),
      status: 'SOLICITADO'
    });

    const exameCriado = await Exame.findByPk(exame.id, {
      include: [
        {
          model: Paciente,
          as: 'paciente',
          include: [{ model: Pessoa, as: 'pessoa' }]
        },
        {
          model: Medico,
          as: 'medico_solicitante',
          include: [{ model: Pessoa, as: 'pessoa' }]
        }
      ]
    });

    return res.status(201).json({
      message: 'Exame solicitado com sucesso',
      exame: exameCriado
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Atualizar exame
router.put('/:id', auth, authorize('MEDICO', 'ADMINISTRADOR'), async (req, res) => {
  try {
    const exame = await Exame.findByPk(req.params.id);

    if (!exame) {
      return res.status(404).json({ error: 'Exame não encontrado' });
    }

    await exame.update(req.body);

    const exameAtualizado = await Exame.findByPk(req.params.id, {
      include: [
        {
          model: Paciente,
          as: 'paciente',
          include: [{ model: Pessoa, as: 'pessoa' }]
        },
        {
          model: Medico,
          as: 'medico_solicitante',
          include: [{ model: Pessoa, as: 'pessoa' }]
        }
      ]
    });

    return res.json({
      message: 'Exame atualizado',
      exame: exameAtualizado
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Adicionar resultado
router.put('/:id/resultado', auth, authorize('MEDICO', 'ADMINISTRADOR'), async (req, res) => {
  try {
    const { resultado, arquivo_resultado } = req.body;

    const exame = await Exame.findByPk(req.params.id);

    if (!exame) {
      return res.status(404).json({ error: 'Exame não encontrado' });
    }

    await exame.update({
      resultado,
      arquivo_resultado,
      data_realizacao: new Date(),
      status: 'REALIZADO'
    });

    return res.json({
      message: 'Resultado adicionado com sucesso',
      exame
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Exames do paciente
router.get('/paciente/:paciente_id', auth, async (req, res) => {
  try {
    const exames = await Exame.findAll({
      where: { paciente_id: req.params.paciente_id },
      include: [
        {
          model: Medico,
          as: 'medico_solicitante',
          include: [{ model: Pessoa, as: 'pessoa' }]
        }
      ],
      order: [['data_solicitacao', 'DESC']]
    });

    return res.json({ exames });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

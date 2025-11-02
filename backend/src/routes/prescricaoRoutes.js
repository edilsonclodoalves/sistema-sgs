const express = require('express');
const router = express.Router();
const { Prescricao, Prontuario, Paciente, Medico, Pessoa } = require('../models');
const { auth, authorize } = require('../middlewares/auth');

// Listar prescrições
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, prontuario_id } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (prontuario_id) where.prontuario_id = prontuario_id;

    const { count, rows: prescricoes } = await Prescricao.findAndCountAll({
      where,
      include: [{
        model: Prontuario,
        as: 'prontuario',
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
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      prescricoes,
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

// Buscar prescrição por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const prescricao = await Prescricao.findByPk(req.params.id, {
      include: [{
        model: Prontuario,
        as: 'prontuario',
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
      }]
    });

    if (!prescricao) {
      return res.status(404).json({ error: 'Prescrição não encontrada' });
    }

    return res.json({ prescricao });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Criar prescrição
router.post('/', auth, authorize('MEDICO', 'ADMINISTRADOR'), async (req, res) => {
  try {
    const {
      prontuario_id, medicamento, dosagem, via_administracao,
      frequencia, duracao, observacoes
    } = req.body;

    if (!prontuario_id || !medicamento || !dosagem || !frequencia || !duracao) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'Prontuário, medicamento, dosagem, frequência e duração são obrigatórios'
      });
    }

    const prescricao = await Prescricao.create({
      prontuario_id,
      medicamento,
      dosagem,
      via_administracao,
      frequencia,
      duracao,
      observacoes
    });

    const prescricaoCriada = await Prescricao.findByPk(prescricao.id, {
      include: [{
        model: Prontuario,
        as: 'prontuario',
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
      }]
    });

    return res.status(201).json({
      message: 'Prescrição criada com sucesso',
      prescricao: prescricaoCriada
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Atualizar prescrição
router.put('/:id', auth, authorize('MEDICO', 'ADMINISTRADOR'), async (req, res) => {
  try {
    const prescricao = await Prescricao.findByPk(req.params.id);

    if (!prescricao) {
      return res.status(404).json({ error: 'Prescrição não encontrada' });
    }

    await prescricao.update(req.body);

    const prescricaoAtualizada = await Prescricao.findByPk(req.params.id, {
      include: [{
        model: Prontuario,
        as: 'prontuario'
      }]
    });

    return res.json({
      message: 'Prescrição atualizada',
      prescricao: prescricaoAtualizada
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Deletar prescrição
router.delete('/:id', auth, authorize('MEDICO', 'ADMINISTRADOR'), async (req, res) => {
  try {
    const prescricao = await Prescricao.findByPk(req.params.id);

    if (!prescricao) {
      return res.status(404).json({ error: 'Prescrição não encontrada' });
    }

    await prescricao.destroy();

    return res.json({ message: 'Prescrição deletada com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Prescrições de um prontuário
router.get('/prontuario/:prontuario_id', auth, async (req, res) => {
  try {
    const prescricoes = await Prescricao.findAll({
      where: { prontuario_id: req.params.prontuario_id },
      order: [['createdAt', 'DESC']]
    });

    return res.json({ prescricoes });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

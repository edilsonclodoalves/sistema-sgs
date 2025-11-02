const express = require('express');
const router = express.Router();
const { Medico, Pessoa, Usuario, Consulta } = require('../models');
const { Op } = require('sequelize');
const { auth, authorize } = require('../middlewares/auth');

// Listar médicos
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', especialidade = '' } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { '$pessoa.nome_completo$': { [Op.like]: `%${search}%` } },
        { crm: { [Op.like]: `%${search}%` } }
      ];
    }

    if (especialidade) where.especialidade = { [Op.like]: `%${especialidade}%` };

    const { count, rows: medicos } = await Medico.findAndCountAll({
      where,
      include: [{ model: Pessoa, as: 'pessoa' }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    return res.json({
      medicos,
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

// Buscar médico por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const medico = await Medico.findByPk(req.params.id, {
      include: [{ model: Pessoa, as: 'pessoa' }]
    });

    if (!medico) {
      return res.status(404).json({ error: 'Médico não encontrado' });
    }

    return res.json({ medico });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Criar médico
router.post('/', auth, authorize('ADMINISTRADOR'), async (req, res) => {
  try {
    const { cpf, nome_completo, email, crm, crm_uf, especialidade, valor_consulta } = req.body;

    if (!cpf || !nome_completo || !email || !crm || !especialidade) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const pessoa = await Pessoa.create({
      cpf, nome_completo, email,
      data_nascimento: req.body.data_nascimento || '1980-01-01',
      sexo: req.body.sexo || 'M',
      telefone: req.body.telefone || '0000000000',
      ativo: true
    });

    const medico = await Medico.create({
      pessoa_id: pessoa.id,
      crm, crm_uf, especialidade, valor_consulta
    });

    if (req.body.criar_usuario) {
      await Usuario.create({
        pessoa_id: pessoa.id,
        email, senha: req.body.senha || 'medico123',
        perfil: 'MEDICO', ativo: true
      });
    }

    const medicoCriado = await Medico.findByPk(medico.id, {
      include: [{ model: Pessoa, as: 'pessoa' }]
    });

    return res.status(201).json({ message: 'Médico criado', medico: medicoCriado });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Atualizar médico
router.put('/:id', auth, authorize('ADMINISTRADOR'), async (req, res) => {
  try {
    const medico = await Medico.findByPk(req.params.id, {
      include: [{ model: Pessoa, as: 'pessoa' }]
    });

    if (!medico) {
      return res.status(404).json({ error: 'Médico não encontrado' });
    }

    if (req.body.pessoa) await medico.pessoa.update(req.body.pessoa);
    await medico.update(req.body);

    return res.json({ message: 'Médico atualizado', medico });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Desativar médico
router.delete('/:id', auth, authorize('ADMINISTRADOR'), async (req, res) => {
  try {
    const medico = await Medico.findByPk(req.params.id, {
      include: [{ model: Pessoa, as: 'pessoa' }]
    });

    if (!medico) {
      return res.status(404).json({ error: 'Médico não encontrado' });
    }

    await medico.pessoa.update({ ativo: false });
    return res.json({ message: 'Médico desativado' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Agenda do médico
router.get('/:id/agenda', auth, async (req, res) => {
  try {
    const where = { medico_id: req.params.id };
    
    if (req.query.data_inicio && req.query.data_fim) {
      where.data_hora = {
        [Op.between]: [new Date(req.query.data_inicio), new Date(req.query.data_fim)]
      };
    }

    const consultas = await Consulta.findAll({
      where,
      order: [['data_hora', 'ASC']]
    });

    return res.json({ consultas });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

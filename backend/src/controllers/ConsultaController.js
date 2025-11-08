const { Consulta, Paciente, Medico, Pessoa, Prontuario } = require('../models');
const { Op } = require('sequelize');

class ConsultaController {
  async index(req, res) {
    try {
      const { 
        page = 1, limit = 10, status, medico_id, paciente_id,
        data_inicio, data_fim 
      } = req.query;

      const where = {};
      if (status) where.status = status;
      if (medico_id) where.medico_id = medico_id;
      if (paciente_id) where.paciente_id = paciente_id;
      
      if (data_inicio && data_fim) {
        where.data_hora = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      const { count, rows: consultas } = await Consulta.findAndCountAll({
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
          }
        ],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['data_hora', 'DESC']]
      });

      return res.json({
        consultas,
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
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const consulta = await Consulta.findByPk(id, {
        include: [
          { model: Paciente, as: 'paciente', include: [{ model: Pessoa, as: 'pessoa' }] },
          { model: Medico, as: 'medico', include: [{ model: Pessoa, as: 'pessoa' }] }
        ]
      });

      if (!consulta) {
        return res.status(404).json({ error: 'Consulta não encontrada' });
      }

      return res.json(consulta);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async byPaciente(req, res) {
    try {
      const { paciente_id } = req.params;

      const consultas = await Consulta.findAll({
        where: { paciente_id },
        include: [
          { model: Paciente, as: 'paciente', include: [{ model: Pessoa, as: 'pessoa' }] },
          { model: Medico, as: 'medico', include: [{ model: Pessoa, as: 'pessoa' }] }
        ],
        order: [['data_hora', 'DESC']]
      });

      return res.json(consultas);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async store(req, res) {
    try {
      const { paciente_id, medico_id, data_hora, tipo, observacoes } = req.body;

      if (!paciente_id || !medico_id || !data_hora) {
        return res.status(400).json({
          error: 'Paciente, médico e data/hora são obrigatórios'
        });
      }

      const dataHoraConsulta = new Date(data_hora);
      const consultaExistente = await Consulta.findOne({
        where: {
          medico_id,
          data_hora: {
            [Op.between]: [
              new Date(dataHoraConsulta.getTime() - 30 * 60000),
              new Date(dataHoraConsulta.getTime() + 30 * 60000)
            ]
          },
          status: { [Op.notIn]: ['CANCELADA'] }
        }
      });

      if (consultaExistente) {
        return res.status(400).json({
          error: 'Horário não disponível',
          message: 'Já existe uma consulta agendada neste horário'
        });
      }

      const consulta = await Consulta.create({
        paciente_id,
        medico_id,
        data_hora: dataHoraConsulta,
        tipo: tipo || 'CONSULTA',
        status: 'AGENDADA',
        observacoes
      });

      const consultaCriada = await Consulta.findByPk(consulta.id, {
        include: [
          { model: Paciente, as: 'paciente', include: [{ model: Pessoa, as: 'pessoa' }] },
          { model: Medico, as: 'medico', include: [{ model: Pessoa, as: 'pessoa' }] }
        ]
      });

      return res.status(201).json({
        message: 'Consulta agendada com sucesso',
        consulta: consultaCriada
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      const consulta = await Consulta.findByPk(id);
      if (!consulta) {
        return res.status(404).json({ error: 'Consulta não encontrada' });
      }

      await consulta.update(dados);

      const consultaAtualizada = await Consulta.findByPk(id, {
        include: [
          { model: Paciente, as: 'paciente', include: [{ model: Pessoa, as: 'pessoa' }] },
          { model: Medico, as: 'medico', include: [{ model: Pessoa, as: 'pessoa' }] }
        ]
      });

      return res.json({
        message: 'Consulta atualizada com sucesso',
        consulta: consultaAtualizada
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async cancelar(req, res) {
    try {
      const { id } = req.params;
      const { motivo_cancelamento } = req.body;

      const consulta = await Consulta.findByPk(id);
      if (!consulta) {
        return res.status(404).json({ error: 'Consulta não encontrada' });
      }

      await consulta.update({
        status: 'CANCELADA',
        motivo_cancelamento
      });

      return res.json({ message: 'Consulta cancelada com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ConsultaController();

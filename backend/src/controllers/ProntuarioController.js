const { Prontuario, Paciente, Medico, Usuario, Prescricao, Exame } = require('../models');
const { Op } = require('sequelize');

class ProntuarioController {
  // Listar todos os prontuários
  async index(req, res) {
    try {
      const { paciente_id, medico_id, page = 1, limit = 10 } = req.query;
      
      const where = {};
      if (paciente_id) where.paciente_id = paciente_id;
      if (medico_id) where.medico_id = medico_id;

      const offset = (page - 1) * limit;

      const prontuarios = await Prontuario.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        include: [
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['id', 'pessoa_id'],
            include: [{
              model: Usuario,
              as: 'pessoa',
              attributes: ['nome', 'email', 'cpf']
            }]
          },
          {
            model: Medico,
            as: 'medico',
            attributes: ['id', 'pessoa_id', 'crm', 'especialidade'],
            include: [{
              model: Usuario,
              as: 'pessoa',
              attributes: ['nome', 'email']
            }]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.json({
        prontuarios: prontuarios.rows,
        total: prontuarios.count,
        pages: Math.ceil(prontuarios.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Erro ao listar prontuários:', error);
      return res.status(500).json({
        error: 'Erro ao listar prontuários',
        message: error.message
      });
    }
  }

  // Buscar prontuário por ID
  async show(req, res) {
    try {
      const { id } = req.params;

      const prontuario = await Prontuario.findByPk(id, {
        include: [
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['id', 'pessoa_id'],
            include: [{
              model: Usuario,
              as: 'pessoa',
              attributes: ['nome', 'email', 'cpf', 'telefone', 'data_nascimento']
            }]
          },
          {
            model: Medico,
            as: 'medico',
            attributes: ['id', 'pessoa_id', 'crm', 'especialidade'],
            include: [{
              model: Usuario,
              as: 'pessoa',
              attributes: ['nome', 'email']
            }]
          },
          {
            model: Prescricao,
            as: 'prescricoes',
            attributes: ['id', 'medicamentos', 'dosagem', 'frequencia', 'duracao', 'observacoes', 'created_at'],
            limit: 5,
            order: [['created_at', 'DESC']]
          },
          {
            model: Exame,
            as: 'exames',
            attributes: ['id', 'tipo', 'descricao', 'status', 'resultado', 'data_solicitacao', 'data_realizacao'],
            limit: 5,
            order: [['data_solicitacao', 'DESC']]
          }
        ]
      });

      if (!prontuario) {
        return res.status(404).json({ error: 'Prontuário não encontrado' });
      }

      return res.json(prontuario);
    } catch (error) {
      console.error('Erro ao buscar prontuário:', error);
      return res.status(500).json({
        error: 'Erro ao buscar prontuário',
        message: error.message
      });
    }
  }

  // Buscar prontuários por paciente
  async findByPaciente(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o paciente existe
      const paciente = await Paciente.findByPk(id);
      if (!paciente) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }

      const prontuarios = await Prontuario.findAll({
        where: { paciente_id: id },
        include: [
          {
            model: Medico,
            as: 'medico',
            attributes: ['id', 'pessoa_id', 'crm', 'especialidade'],
            include: [{
              model: Usuario,
              as: 'pessoa',
              attributes: ['nome', 'email']
            }]
          },
          {
            model: Prescricao,
            as: 'prescricoes',
            attributes: ['id', 'medicamentos', 'created_at']
          },
          {
            model: Exame,
            as: 'exames',
            attributes: ['id', 'tipo', 'status', 'data_solicitacao']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Se não houver prontuários, retornar array vazio
      return res.json({
        prontuarios: prontuarios || [],
        total: prontuarios.length
      });
    } catch (error) {
      console.error('Erro ao buscar prontuários do paciente:', error);
      return res.status(500).json({
        error: 'Erro ao buscar prontuários do paciente',
        message: error.message
      });
    }
  }

  // Criar novo prontuário
  async store(req, res) {
    try {
      const {
        paciente_id,
        medico_id,
        anamnese,
        exame_fisico,
        hipotese_diagnostica,
        diagnostico_definitivo,
        tratamento,
        observacoes
      } = req.body;

      // Validação dos campos obrigatórios
      if (!paciente_id) {
        return res.status(400).json({ error: 'O campo paciente_id é obrigatório' });
      }

      if (!medico_id) {
        return res.status(400).json({ error: 'O campo medico_id é obrigatório' });
      }

      // Verificar se o paciente existe
      const paciente = await Paciente.findByPk(paciente_id);
      if (!paciente) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }

      // Verificar se o médico existe
      const medico = await Medico.findByPk(medico_id);
      if (!medico) {
        return res.status(404).json({ error: 'Médico não encontrado' });
      }

      // Criar o prontuário
      const prontuario = await Prontuario.create({
        paciente_id: parseInt(paciente_id),
        medico_id: parseInt(medico_id),
        anamnese: anamnese || '',
        exame_fisico: exame_fisico || '',
        hipotese_diagnostica: hipotese_diagnostica || '',
        diagnostico_definitivo: diagnostico_definitivo || '',
        tratamento: tratamento || '',
        observacoes: observacoes || ''
      });

      // Buscar o prontuário criado com as associações
      const prontuarioCriado = await Prontuario.findByPk(prontuario.id, {
        include: [
          {
            model: Paciente,
            as: 'paciente',
            include: [{
              model: Usuario,
              as: 'pessoa',
              attributes: ['nome', 'email', 'cpf']
            }]
          },
          {
            model: Medico,
            as: 'medico',
            include: [{
              model: Usuario,
              as: 'pessoa',
              attributes: ['nome', 'email']
            }]
          }
        ]
      });

      return res.status(201).json(prontuarioCriado);

    } catch (error) {
      console.error('Erro ao criar prontuário:', error);

      // Tratamento para erros de validação
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Erro de validação',
          errors: error.errors.map(e => ({
            field: e.path,
            message: e.message
          }))
        });
      }

      return res.status(500).json({
        error: 'Erro ao criar prontuário',
        message: error.message
      });
    }
  }

  // Atualizar prontuário
  async update(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      const prontuario = await Prontuario.findByPk(id);

      if (!prontuario) {
        return res.status(404).json({ error: 'Prontuário não encontrado' });
      }

      // Remover campos que não devem ser atualizados
      delete dados.paciente_id;
      delete dados.id;
      delete dados.created_at;
      delete dados.updated_at;

      await prontuario.update(dados);

      // Buscar prontuário atualizado com associações
      const prontuarioAtualizado = await Prontuario.findByPk(id, {
        include: [
          {
            model: Paciente,
            as: 'paciente',
            include: [{
              model: Usuario,
              as: 'pessoa',
              attributes: ['nome', 'email', 'cpf']
            }]
          },
          {
            model: Medico,
            as: 'medico',
            include: [{
              model: Usuario,
              as: 'pessoa',
              attributes: ['nome', 'email']
            }]
          }
        ]
      });

      return res.json(prontuarioAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar prontuário:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar prontuário',
        message: error.message
      });
    }
  }

  // Deletar prontuário
  async destroy(req, res) {
    try {
      const { id } = req.params;

      const prontuario = await Prontuario.findByPk(id);

      if (!prontuario) {
        return res.status(404).json({ error: 'Prontuário não encontrado' });
      }

      // Verificar se existem prescrições ou exames vinculados
      const prescricoes = await Prescricao.count({ where: { prontuario_id: id } });
      const exames = await Exame.count({ where: { prontuario_id: id } });

      if (prescricoes > 0 || exames > 0) {
        return res.status(400).json({
          error: 'Não é possível deletar prontuário com prescrições ou exames vinculados'
        });
      }

      await prontuario.destroy();

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar prontuário:', error);
      return res.status(500).json({
        error: 'Erro ao deletar prontuário',
        message: error.message
      });
    }
  }

  // Adicionar evolução ao prontuário
  async addEvolucao(req, res) {
    try {
      const { id } = req.params;
      const { descricao, medico_id } = req.body;

      if (!descricao) {
        return res.status(400).json({ error: 'Descrição é obrigatória' });
      }

      const prontuario = await Prontuario.findByPk(id);
      if (!prontuario) {
        return res.status(404).json({ error: 'Prontuário não encontrado' });
      }

      // Adicionar evolução ao campo observações com timestamp
      const evolucao = `\n[${new Date().toLocaleString('pt-BR')}] - Dr(a) ${medico_id}: ${descricao}`;
      prontuario.observacoes = (prontuario.observacoes || '') + evolucao;

      await prontuario.save();

      return res.json({
        message: 'Evolução adicionada com sucesso',
        prontuario
      });
    } catch (error) {
      console.error('Erro ao adicionar evolução:', error);
      return res.status(500).json({
        error: 'Erro ao adicionar evolução',
        message: error.message
      });
    }
  }

  // Buscar histórico completo do paciente
  async historicoPaciente(req, res) {
    try {
      const { paciente_id } = req.params;

      const historico = await Prontuario.findAll({
        where: { paciente_id },
        include: [
          {
            model: Medico,
            as: 'medico',
            include: [{
              model: Usuario,
              as: 'pessoa',
              attributes: ['nome']
            }]
          },
          {
            model: Prescricao,
            as: 'prescricoes',
            attributes: ['id', 'medicamentos', 'created_at']
          },
          {
            model: Exame,
            as: 'exames',
            attributes: ['id', 'tipo', 'status', 'resultado', 'data_solicitacao']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.json({
        paciente_id,
        total_prontuarios: historico.length,
        prontuarios: historico
      });
    } catch (error) {
      console.error('Erro ao buscar histórico do paciente:', error);
      return res.status(500).json({
        error: 'Erro ao buscar histórico do paciente',
        message: error.message
      });
    }
  }
}

module.exports = new ProntuarioController();

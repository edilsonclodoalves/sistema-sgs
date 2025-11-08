const { Prescricao, Prontuario, Paciente, Medico, Usuario } = require('../models');
const { Op } = require('sequelize');

class PrescricaoController {
  // Listar todas as prescrições
  async index(req, res) {
    try {
      const { prontuario_id, paciente_id, medico_id, page = 1, limit = 10 } = req.query;

      const where = {};
      if (prontuario_id) where.prontuario_id = prontuario_id;

      // Se filtrar por paciente ou médico, precisa fazer join com Prontuario
      const include = [
        {
          model: Prontuario,
          as: 'prontuario',
          attributes: ['id', 'paciente_id', 'medico_id'],
          where: {},
          include: [
            {
              model: Paciente,
              as: 'paciente',
              attributes: ['id'],
              include: [{
                model: Usuario,
                as: 'pessoa',
                attributes: ['nome', 'cpf']
              }]
            },
            {
              model: Medico,
              as: 'medico',
              attributes: ['id', 'crm', 'especialidade'],
              include: [{
                model: Usuario,
                as: 'pessoa',
                attributes: ['nome']
              }]
            }
          ]
        }
      ];

      if (paciente_id) {
        include[0].where.paciente_id = paciente_id;
      }

      if (medico_id) {
        include[0].where.medico_id = medico_id;
      }

      const offset = (page - 1) * limit;

      const prescricoes = await Prescricao.findAndCountAll({
        where,
        include,
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']]
      });

      return res.json({
        prescricoes: prescricoes.rows,
        total: prescricoes.count,
        pages: Math.ceil(prescricoes.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Erro ao listar prescrições:', error);
      return res.status(500).json({
        error: 'Erro ao listar prescrições',
        message: error.message
      });
    }
  }

  // Buscar prescrição por ID
  async show(req, res) {
    try {
      const { id } = req.params;

      const prescricao = await Prescricao.findByPk(id, {
        include: [
          {
            model: Prontuario,
            as: 'prontuario',
            attributes: ['id', 'paciente_id', 'medico_id', 'diagnostico_definitivo'],
            include: [
              {
                model: Paciente,
                as: 'paciente',
                include: [{
                  model: Usuario,
                  as: 'pessoa',
                  attributes: ['nome', 'cpf', 'data_nascimento']
                }]
              },
              {
                model: Medico,
                as: 'medico',
                attributes: ['id', 'crm', 'especialidade'],
                include: [{
                  model: Usuario,
                  as: 'pessoa',
                  attributes: ['nome']
                }]
              }
            ]
          }
        ]
      });

      if (!prescricao) {
        return res.status(404).json({ error: 'Prescrição não encontrada' });
      }

      return res.json(prescricao);
    } catch (error) {
      console.error('Erro ao buscar prescrição:', error);
      return res.status(500).json({
        error: 'Erro ao buscar prescrição',
        message: error.message
      });
    }
  }

  // Buscar prescrições por prontuário
  async findByProntuario(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o prontuário existe
      const prontuario = await Prontuario.findByPk(id);
      if (!prontuario) {
        return res.status(404).json({ error: 'Prontuário não encontrado' });
      }

      const prescricoes = await Prescricao.findAll({
        where: { prontuario_id: id },
        order: [['created_at', 'DESC']]
      });

      return res.json({
        prontuario_id: id,
        total: prescricoes.length,
        prescricoes
      });
    } catch (error) {
      console.error('Erro ao buscar prescrições do prontuário:', error);
      return res.status(500).json({
        error: 'Erro ao buscar prescrições do prontuário',
        message: error.message
      });
    }
  }

  // Buscar prescrições por paciente
  async prescricoesPaciente(req, res) {
    try {
      const { paciente_id } = req.params;

      // Verificar se o paciente existe
      const paciente = await Paciente.findByPk(paciente_id);
      if (!paciente) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }

      const prescricoes = await Prescricao.findAll({
        include: [{
          model: Prontuario,
          as: 'prontuario',
          where: { paciente_id },
          attributes: ['id', 'diagnostico_definitivo', 'created_at'],
          include: [
            {
              model: Paciente,
              as: 'paciente',
              attributes: ['id'],
              include: [{
                model: Usuario,
                as: 'pessoa',
                attributes: ['nome', 'cpf', 'data_nascimento']
              }]
            },
            {
              model: Medico,
              as: 'medico',
              attributes: ['id', 'crm', 'especialidade'],
              include: [{
                model: Usuario,
                as: 'pessoa',
                attributes: ['nome']
              }]
            }
          ]
        }],
        order: [['created_at', 'DESC']]
      });

      return res.json({
        paciente_id,
        total: prescricoes.length,
        prescricoes
      });
    } catch (error) {
      console.error('Erro ao buscar prescrições do paciente:', error);
      return res.status(500).json({
        error: 'Erro ao buscar prescrições do paciente',
        message: error.message
      });
    }
  }

  // Criar nova prescrição
  async store(req, res) {
    try {
      const {
        prontuario_id,
        medicamentos,
        dosagem,
        frequencia,
        duracao,
        via_administracao,
        observacoes
      } = req.body;

      // Validações
      if (!prontuario_id) {
        return res.status(400).json({ error: 'O campo prontuario_id é obrigatório' });
      }

      if (!medicamentos || (Array.isArray(medicamentos) && medicamentos.length === 0)) {
        return res.status(400).json({ error: 'Pelo menos um medicamento deve ser informado' });
      }

      // Verificar se o prontuário existe
      const prontuario = await Prontuario.findByPk(prontuario_id);
      if (!prontuario) {
        return res.status(404).json({ error: 'Prontuário não encontrado' });
      }

      // Converter medicamentos para string se for array
      const medicamentosStr = Array.isArray(medicamentos) 
        ? medicamentos.join(', ') 
        : medicamentos;

      // Criar a prescrição
      const prescricao = await Prescricao.create({
        prontuario_id,
        medicamentos: medicamentosStr,
        dosagem,
        frequencia,
        duracao,
        via_administracao,
        observacoes
      });

      // Buscar a prescrição criada com as associações
      const prescricaoCriada = await Prescricao.findByPk(prescricao.id, {
        include: [
          {
            model: Prontuario,
            as: 'prontuario',
            attributes: ['id', 'diagnostico_definitivo'],
            include: [
              {
                model: Paciente,
                as: 'paciente',
                include: [{
                  model: Usuario,
                  as: 'pessoa',
                  attributes: ['nome', 'cpf']
                }]
              },
              {
                model: Medico,
                as: 'medico',
                attributes: ['crm', 'especialidade'],
                include: [{
                  model: Usuario,
                  as: 'pessoa',
                  attributes: ['nome']
                }]
              }
            ]
          }
        ]
      });

      return res.status(201).json(prescricaoCriada);
    } catch (error) {
      console.error('Erro ao criar prescrição:', error);
      return res.status(500).json({
        error: 'Erro ao criar prescrição',
        message: error.message
      });
    }
  }

  // Atualizar prescrição
  async update(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      const prescricao = await Prescricao.findByPk(id);

      if (!prescricao) {
        return res.status(404).json({ error: 'Prescrição não encontrada' });
      }

      // Remover campos que não devem ser atualizados
      delete dados.prontuario_id;
      delete dados.id;
      delete dados.created_at;
      delete dados.updated_at;

      // Converter medicamentos para string se for array
      if (Array.isArray(dados.medicamentos)) {
        dados.medicamentos = dados.medicamentos.join(', ');
      }

      await prescricao.update(dados);

      // Buscar prescrição atualizada com associações
      const prescricaoAtualizada = await Prescricao.findByPk(id, {
        include: [
          {
            model: Prontuario,
            as: 'prontuario',
            attributes: ['id', 'diagnostico_definitivo'],
            include: [
              {
                model: Paciente,
                as: 'paciente',
                include: [{
                  model: Usuario,
                  as: 'pessoa',
                  attributes: ['nome', 'cpf']
                }]
              },
              {
                model: Medico,
                as: 'medico',
                attributes: ['crm'],
                include: [{
                  model: Usuario,
                  as: 'pessoa',
                  attributes: ['nome']
                }]
              }
            ]
          }
        ]
      });

      return res.json(prescricaoAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar prescrição:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar prescrição',
        message: error.message
      });
    }
  }

  // Deletar prescrição
  async destroy(req, res) {
    try {
      const { id } = req.params;

      const prescricao = await Prescricao.findByPk(id);

      if (!prescricao) {
        return res.status(404).json({ error: 'Prescrição não encontrada' });
      }

      await prescricao.destroy();

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar prescrição:', error);
      return res.status(500).json({
        error: 'Erro ao deletar prescrição',
        message: error.message
      });
    }
  }

  // Imprimir prescrição
  async print(req, res) {
    try {
      const { id } = req.params;

      const prescricao = await Prescricao.findByPk(id, {
        include: [
          {
            model: Prontuario,
            as: 'prontuario',
            include: [
              {
                model: Paciente,
                as: 'paciente',
                include: [{
                  model: Usuario,
                  as: 'pessoa',
                  attributes: ['nome', 'cpf', 'data_nascimento', 'telefone']
                }]
              },
              {
                model: Medico,
                as: 'medico',
                attributes: ['crm', 'especialidade'],
                include: [{
                  model: Usuario,
                  as: 'pessoa',
                  attributes: ['nome']
                }]
              }
            ]
          }
        ]
      });

      if (!prescricao) {
        return res.status(404).json({ error: 'Prescrição não encontrada' });
      }

      // Formatar dados para impressão
      const dadosImpressao = {
        id: prescricao.id,
        data: prescricao.created_at,
        paciente: {
          nome: prescricao.prontuario.paciente.pessoa.nome,
          cpf: prescricao.prontuario.paciente.pessoa.cpf,
          data_nascimento: prescricao.prontuario.paciente.pessoa.data_nascimento,
          telefone: prescricao.prontuario.paciente.pessoa.telefone
        },
        medico: {
          nome: prescricao.prontuario.medico.pessoa.nome,
          crm: prescricao.prontuario.medico.crm,
          especialidade: prescricao.prontuario.medico.especialidade
        },
        medicamentos: prescricao.medicamentos,
        dosagem: prescricao.dosagem,
        frequencia: prescricao.frequencia,
        duracao: prescricao.duracao,
        via_administracao: prescricao.via_administracao,
        observacoes: prescricao.observacoes
      };

      return res.json(dadosImpressao);
    } catch (error) {
      console.error('Erro ao preparar prescrição para impressão:', error);
      return res.status(500).json({
        error: 'Erro ao preparar prescrição para impressão',
        message: error.message
      });
    }
  }
}

module.exports = new PrescricaoController();
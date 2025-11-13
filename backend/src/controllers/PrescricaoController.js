const { Prescricao, Prontuario, Paciente, Medico, Usuario } = require('../models');
const { Op } = require('sequelize');

class PrescricaoController {
  // Listar todas as prescrições (com controle de acesso)
  async index(req, res) {
    try {
      const { prontuario_id, paciente_id, medico_id, page = 1, limit = 10 } = req.query;
      const { userPerfil, userId } = req;

      const where = {};
      const include = [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'pessoa_id']
        },
        {
          model: Medico,
          as: 'medico',
          attributes: ['id', 'crm', 'especialidade', 'pessoa_id']
        }
      ];

      // Controle de acesso baseado no perfil
      if (userPerfil === 'PACIENTE') {
        const paciente = await Paciente.findOne({ where: { pessoa_id: userId } });
        if (!paciente) {
          return res.status(404).json({
            error: 'Paciente não encontrado',
            message: 'Usuário não está associado a um paciente.'
          });
        }
        where.paciente_id = paciente.id;
      } else if (userPerfil === 'MEDICO') {
        const medico = await Medico.findOne({ where: { pessoa_id: userId } });
        if (!medico) {
          return res.status(404).json({
            error: 'Médico não encontrado',
            message: 'Usuário não está associado a um médico.'
          });
        }
        where.medico_id = medico.id;
      } else if (userPerfil === 'ADMINISTRADOR') {
        // Admin vê todas as prescrições
      } else {
        return res.status(403).json({
          error: 'Acesso negado',
          message: `Perfil '${userPerfil}' não autorizado a visualizar prescrições.`
        });
      }

      // Filtros opcionais via query string
      if (prontuario_id) where.prontuario_id = prontuario_id;
      if (paciente_id) where.paciente_id = paciente_id;
      if (medico_id) where.medico_id = medico_id;

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
            model: Paciente,
            as: 'paciente',
            attributes: ['id', 'pessoa_id', 'tipo_sanguineo', 'alergias']
          },
          {
            model: Medico,
            as: 'medico',
            attributes: ['id', 'crm', 'especialidade', 'pessoa_id']
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

  // Buscar prescrições por paciente
  async prescricoesPaciente(req, res) {
    try {
      const { paciente_id } = req.params;
      const { userPerfil, userId } = req;

      // Validar se o paciente_id foi fornecido
      if (!paciente_id) {
        return res.status(400).json({
          error: 'Parâmetro obrigatório ausente',
          message: 'É necessário especificar o ID do paciente na URL. Use: /api/prescricoes/paciente/{paciente_id}'
        });
      }

      const paciente = await Paciente.findByPk(paciente_id);
      if (!paciente) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }

      // Controle de acesso baseado no perfil
      if (userPerfil === 'PACIENTE') {
        // Paciente só pode ver suas próprias prescrições
        const pacienteLogado = await Paciente.findOne({ where: { pessoa_id: userId } });
        if (!pacienteLogado || pacienteLogado.id !== parseInt(paciente_id)) {
          return res.status(403).json({
            error: 'Acesso negado',
            message: 'Você só pode visualizar suas próprias prescrições.'
          });
        }
      } else if (userPerfil === 'MEDICO' || userPerfil === 'ADMINISTRADOR') {
        // Médico e Admin podem ver prescrições de qualquer paciente
      } else {
        // Perfil não autorizado
        return res.status(403).json({
          error: 'Acesso negado',
          message: `Perfil '${userPerfil}' não autorizado a visualizar prescrições.`
        });
      }

      const prescricoes = await Prescricao.findAll({
        where: { paciente_id },
        include: [
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['id', 'pessoa_id']
          },
          {
            model: Medico,
            as: 'medico',
            attributes: ['id', 'crm', 'especialidade', 'pessoa_id']
          }
        ],
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
        paciente_id,
        medico_id,
        medicamento,
        dosagem,
        frequencia,
        duracao,
        observacoes
      } = req.body;

      // Validações obrigatórias
      if (!paciente_id) {
        return res.status(400).json({ error: 'O campo paciente_id é obrigatório' });
      }

      if (!medico_id) {
        return res.status(400).json({ error: 'O campo medico_id é obrigatório' });
      }

      if (!medicamento || (Array.isArray(medicamento) && medicamento.length === 0)) {
        return res.status(400).json({ error: 'Pelo menos um medicamento deve ser informado' });
      }

      // Verificar se paciente existe
      const paciente = await Paciente.findByPk(paciente_id);
      if (!paciente) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }

      // Verificar se médico existe
      const medico = await Medico.findByPk(medico_id);
      if (!medico) {
        return res.status(404).json({ error: 'Médico não encontrado' });
      }

      // Verificar prontuário se fornecido
      if (prontuario_id) {
        const prontuario = await Prontuario.findByPk(prontuario_id);
        if (!prontuario) {
          return res.status(404).json({ error: 'Prontuário não encontrado' });
        }
      }

      // Converter medicamentos para string se for array
      const medicamentoStr = Array.isArray(medicamento)
        ? medicamento.join(', ')
        : medicamento;

      const prescricao = await Prescricao.create({
        prontuario_id: prontuario_id || null,
        paciente_id,
        medico_id,
        medicamento: medicamentoStr,
        dosagem,
        frequencia,
        duracao,
        observacoes
      });

      const prescricaoCriada = await Prescricao.findByPk(prescricao.id, {
        include: [
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['id', 'pessoa_id']
          },
          {
            model: Medico,
            as: 'medico',
            attributes: ['id', 'crm', 'especialidade', 'pessoa_id']
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
      delete dados.id;
      delete dados.paciente_id;
      delete dados.medico_id;
      delete dados.created_at;
      delete dados.updated_at;

      // Converter medicamento para string se for array
      if (Array.isArray(dados.medicamento)) {
        dados.medicamento = dados.medicamento.join(', ');
      }

      await prescricao.update(dados);

      const prescricaoAtualizada = await Prescricao.findByPk(id, {
        include: [
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['id', 'pessoa_id']
          },
          {
            model: Medico,
            as: 'medico',
            attributes: ['id', 'crm', 'especialidade', 'pessoa_id']
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
}

module.exports = new PrescricaoController();
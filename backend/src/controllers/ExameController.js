const { Exame, Paciente, Medico, Pessoa } = require('../models');
const { Op } = require('sequelize');

class ExameController {
  /**
   * Listar todos os exames
   * GET /api/exames
   */
  async index(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status,
        paciente_id,
        medico_id,
        tipo,
        data_inicio,
        data_fim
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};
      
      if (status) where.status = status;
      if (paciente_id) where.paciente_id = paciente_id;
      if (medico_id) where.medico_solicitante_id = medico_id;
      if (tipo) where.tipo_exame = { [Op.like]: `%${tipo}%` };

      if (data_inicio && data_fim) {
        where.data_solicitacao = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

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
        order: [['data_solicitacao', 'DESC']],
        distinct: true
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
      console.error('Erro ao listar exames:', error);
      return res.status(500).json({
        error: 'Erro ao listar exames',
        message: error.message
      });
    }
  }

  /**
   * Buscar exame por ID
   * GET /api/exames/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const exame = await Exame.findByPk(id, {
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
        return res.status(404).json({
          error: 'Exame não encontrado',
          message: 'Não existe exame com este ID'
        });
      }

      return res.json({
        exame
      });

    } catch (error) {
      console.error('Erro ao buscar exame:', error);
      return res.status(500).json({
        error: 'Erro ao buscar exame',
        message: error.message
      });
    }
  }

  /**
   * Solicitar novo exame
   * POST /api/exames
   */
  async store(req, res) {
    try {
      const {
        paciente_id,
        medico_id,
        tipo_exame,
        descricao,
        observacoes,
        urgente = false,
        data_solicitacao
      } = req.body;

      // Validações básicas
      if (!paciente_id || !medico_id || !tipo_exame) {
        return res.status(400).json({
          error: 'Dados incompletos',
          message: 'Paciente, médico e tipo de exame são obrigatórios'
        });
      }

      // Verificar se paciente existe
      const paciente = await Paciente.findByPk(paciente_id);
      if (!paciente) {
        return res.status(404).json({
          error: 'Paciente não encontrado',
          message: 'Não existe paciente com este ID'
        });
      }

      // Verificar se médico existe
      const medico = await Medico.findByPk(medico_id);
      if (!medico) {
        return res.status(404).json({
          error: 'Médico não encontrado',
          message: 'Não existe médico com este ID'
        });
      }

      // Criar exame
      const exame = await Exame.create({
        paciente_id,
        medico_solicitante_id: medico_id,
        tipo_exame,
        descricao,
        observacoes,
        urgente,
        status: 'SOLICITADO',
        data_solicitacao: data_solicitacao || new Date()
      });

      // Recarregar com relacionamentos
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
      console.error('Erro ao criar exame:', error);

      // Tratamento para erros de validação
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Erro de validação',
          detalhes: error.errors.map(e => ({
            campo: e.path,
            mensagem: e.message
          }))
        });
      }

      return res.status(500).json({
        error: 'Erro ao solicitar exame',
        message: error.message
      });
    }
  }

  /**
   * Atualizar exame
   * PUT /api/exames/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      const exame = await Exame.findByPk(id);

      if (!exame) {
        return res.status(404).json({
          error: 'Exame não encontrado',
          message: 'Não existe exame com este ID'
        });
      }

      // Atualizar exame
      await exame.update({
        tipo_exame: dados.tipo_exame,
        descricao: dados.descricao,
        observacoes: dados.observacoes,
        urgente: dados.urgente,
        status: dados.status,
        data_realizacao: dados.data_realizacao,
        resultado: dados.resultado,
        laudo: dados.laudo,
        arquivo_resultado: dados.arquivo_resultado
      });

      // Recarregar com relacionamentos
      const exameAtualizado = await Exame.findByPk(id, {
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
        message: 'Exame atualizado com sucesso',
        exame: exameAtualizado
      });

    } catch (error) {
      console.error('Erro ao atualizar exame:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar exame',
        message: error.message
      });
    }
  }

  /**
   * Atualizar status do exame
   * PATCH /api/exames/:id/status
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, resultado, laudo, data_realizacao } = req.body;

      if (!status) {
        return res.status(400).json({
          error: 'Status é obrigatório'
        });
      }

      const exame = await Exame.findByPk(id);

      if (!exame) {
        return res.status(404).json({
          error: 'Exame não encontrado'
        });
      }

      // Validar transições de status
      const transicoesValidas = {
        'SOLICITADO': ['AGENDADO', 'REALIZADO', 'CANCELADO'],
        'AGENDADO': ['REALIZADO', 'CANCELADO'],
        'REALIZADO': [],
        'CANCELADO': []
      };

      if (!transicoesValidas[exame.status] || !transicoesValidas[exame.status].includes(status)) {
        return res.status(400).json({
          error: 'Transição de status inválida',
          message: `Não é possível mudar de ${exame.status} para ${status}. Status válidos: ${transicoesValidas[exame.status]?.join(', ') || 'nenhum'}`
        });
      }

      // Atualizar status e dados relacionados
      const updateData = { status };
      
      if (resultado) updateData.resultado = resultado;
      if (laudo) updateData.laudo = laudo;
      if (data_realizacao) updateData.data_realizacao = data_realizacao;
      if (status === 'REALIZADO' && !exame.data_realizacao) {
        updateData.data_realizacao = new Date();
      }

      await exame.update(updateData);

      // Recarregar com relacionamentos
      const exameAtualizado = await Exame.findByPk(id, {
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
        message: 'Status do exame atualizado com sucesso',
        exame: exameAtualizado
      });

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar status do exame',
        message: error.message
      });
    }
  }

  /**
   * Cancelar exame
   * DELETE /api/exames/:id
   */
  async destroy(req, res) {
    try {
      const { id } = req.params;
      const { motivo_cancelamento } = req.body;

      const exame = await Exame.findByPk(id);

      if (!exame) {
        return res.status(404).json({
          error: 'Exame não encontrado',
          message: 'Não existe exame com este ID'
        });
      }

      // Verificar se o exame pode ser cancelado
      if (['REALIZADO', 'LAUDADO', 'CANCELADO'].includes(exame.status)) {
        return res.status(400).json({
          error: 'Exame não pode ser cancelado',
          message: `Exames com status ${exame.status} não podem ser cancelados`
        });
      }

      // Cancelar exame
      await exame.update({
        status: 'CANCELADO',
        observacoes: motivo_cancelamento 
          ? `${exame.observacoes || ''}\nMotivo do cancelamento: ${motivo_cancelamento}`.trim()
          : exame.observacoes
      });

      return res.json({
        message: 'Exame cancelado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao cancelar exame:', error);
      return res.status(500).json({
        error: 'Erro ao cancelar exame',
        message: error.message
      });
    }
  }

  /**
   * Tipos de exames disponíveis
   * GET /api/exames/tipos
   */
  async tipos(req, res) {
    try {
      const tipos = [
        'Hemograma Completo',
        'Glicemia',
        'Colesterol Total e Frações',
        'Triglicerídeos',
        'Ureia e Creatinina',
        'TGO e TGP',
        'TSH e T4 Livre',
        'Raio-X de Tórax',
        'Raio-X de Abdomen',
        'Ultrassonografia Abdominal',
        'Ultrassonografia Pélvica',
        'Eletrocardiograma',
        'Ecocardiograma',
        'Tomografia Computadorizada',
        'Ressonância Magnética',
        'Mamografia',
        'Papanicolau',
        'Outros'
      ];

      return res.json({
        tipos
      });

    } catch (error) {
      console.error('Erro ao buscar tipos:', error);
      return res.status(500).json({
        error: 'Erro ao buscar tipos de exames',
        message: error.message
      });
    }
  }
}

module.exports = new ExameController();

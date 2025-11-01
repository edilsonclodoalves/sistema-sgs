const { Consulta, Paciente, Medico } = require('../models');
const { Op } = require('sequelize');

const consultaController = {
  // Listar todas as consultas
  listarConsultas: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        id_paciente, 
        id_medico, 
        data_inicio, 
        data_fim,
        status 
      } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Construir filtros
      const where = {};
      
      if (id_paciente) {
        where.id_paciente = id_paciente;
      }
      
      if (id_medico) {
        where.id_medico = id_medico;
      }
      
      if (status) {
        where.status = status;
      }
      
      if (data_inicio && data_fim) {
        where.data_consulta = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      } else if (data_inicio) {
        where.data_consulta = {
          [Op.gte]: new Date(data_inicio)
        };
      } else if (data_fim) {
        where.data_consulta = {
          [Op.lte]: new Date(data_fim)
        };
      }
      
      // Buscar consultas com paginação e filtros
      const { count, rows: consultas } = await Consulta.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_consulta', 'DESC']],
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] },
          { model: Medico, attributes: ['id_medico', 'nome', 'crm', 'especialidade'] }
        ]
      });

      return res.status(200).json({
        status: 'success',
        message: 'Consultas listadas com sucesso',
        data: {
          consultas,
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar consultas:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao listar consultas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obter uma consulta pelo ID
  obterConsulta: async (req, res) => {
    try {
      const { id } = req.params;
      
      const consulta = await Consulta.findByPk(id, {
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] },
          { model: Medico, attributes: ['id_medico', 'nome', 'crm', 'especialidade'] }
        ]
      });
      
      if (!consulta) {
        return res.status(404).json({
          status: 'error',
          message: 'Consulta não encontrada'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Consulta encontrada com sucesso',
        data: consulta
      });
    } catch (error) {
      console.error('Erro ao obter consulta:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao obter consulta',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Criar uma nova consulta
  criarConsulta: async (req, res) => {
    try {
      const { id_paciente, id_medico, data_consulta, status, motivo } = req.body;
      
      // Validar dados obrigatórios
      if (!id_paciente || !id_medico || !data_consulta) {
        return res.status(400).json({
          status: 'error',
          message: 'Dados obrigatórios não fornecidos'
        });
      }

      // Verificar se o paciente existe
      const paciente = await Paciente.findByPk(id_paciente);
      if (!paciente) {
        return res.status(404).json({
          status: 'error',
          message: 'Paciente não encontrado'
        });
      }

      // Verificar se o médico existe
      const medico = await Medico.findByPk(id_medico);
      if (!medico) {
        return res.status(404).json({
          status: 'error',
          message: 'Médico não encontrado'
        });
      }

      // Verificar se já existe uma consulta para o mesmo médico no mesmo horário
      const consultaExistente = await Consulta.findOne({
        where: {
          id_medico,
          data_consulta: new Date(data_consulta),
          status: {
            [Op.ne]: 'Cancelada'
          }
        }
      });

      if (consultaExistente) {
        return res.status(409).json({
          status: 'error',
          message: 'Já existe uma consulta agendada para este médico neste horário'
        });
      }

      // Criar a consulta
      const novaConsulta = await Consulta.create({
        id_paciente,
        id_medico,
        data_consulta,
        status: status || 'Agendada',
        motivo
      });

      // Buscar a consulta com os dados relacionados
      const consultaCompleta = await Consulta.findByPk(novaConsulta.id_consulta, {
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] },
          { model: Medico, attributes: ['id_medico', 'nome', 'crm', 'especialidade'] }
        ]
      });

      return res.status(201).json({
        status: 'success',
        message: 'Consulta criada com sucesso',
        data: consultaCompleta
      });
    } catch (error) {
      console.error('Erro ao criar consulta:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao criar consulta',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Atualizar uma consulta existente
  atualizarConsulta: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_paciente, id_medico, data_consulta, status, motivo } = req.body;
      
      // Validar dados obrigatórios
      if (!id_paciente || !id_medico || !data_consulta || !status) {
        return res.status(400).json({
          status: 'error',
          message: 'Dados obrigatórios não fornecidos'
        });
      }

      // Verificar se a consulta existe
      const consulta = await Consulta.findByPk(id);
      if (!consulta) {
        return res.status(404).json({
          status: 'error',
          message: 'Consulta não encontrada'
        });
      }

      // Verificar se o paciente existe
      const paciente = await Paciente.findByPk(id_paciente);
      if (!paciente) {
        return res.status(404).json({
          status: 'error',
          message: 'Paciente não encontrado'
        });
      }

      // Verificar se o médico existe
      const medico = await Medico.findByPk(id_medico);
      if (!medico) {
        return res.status(404).json({
          status: 'error',
          message: 'Médico não encontrado'
        });
      }

      // Verificar se já existe outra consulta para o mesmo médico no mesmo horário
      if (id_medico !== consulta.id_medico || 
          new Date(data_consulta).getTime() !== new Date(consulta.data_consulta).getTime()) {
        
        const consultaExistente = await Consulta.findOne({
          where: {
            id_consulta: { [Op.ne]: id },
            id_medico,
            data_consulta: new Date(data_consulta),
            status: {
              [Op.ne]: 'Cancelada'
            }
          }
        });

        if (consultaExistente) {
          return res.status(409).json({
            status: 'error',
            message: 'Já existe uma consulta agendada para este médico neste horário'
          });
        }
      }

      // Atualizar a consulta
      await consulta.update({
        id_paciente,
        id_medico,
        data_consulta,
        status,
        motivo
      });

      // Buscar a consulta atualizada com os dados relacionados
      const consultaAtualizada = await Consulta.findByPk(id, {
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] },
          { model: Medico, attributes: ['id_medico', 'nome', 'crm', 'especialidade'] }
        ]
      });

      return res.status(200).json({
        status: 'success',
        message: 'Consulta atualizada com sucesso',
        data: consultaAtualizada
      });
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar consulta',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Atualizar parcialmente uma consulta
  atualizarParcialConsulta: async (req, res) => {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;
      
      // Verificar se a consulta existe
      const consulta = await Consulta.findByPk(id);
      if (!consulta) {
        return res.status(404).json({
          status: 'error',
          message: 'Consulta não encontrada'
        });
      }

      // Verificar se está alterando o médico ou a data
      if ((dadosAtualizacao.id_medico && dadosAtualizacao.id_medico !== consulta.id_medico) ||
          (dadosAtualizacao.data_consulta && 
           new Date(dadosAtualizacao.data_consulta).getTime() !== new Date(consulta.data_consulta).getTime())) {
        
        // Verificar se o médico existe
        if (dadosAtualizacao.id_medico) {
          const medico = await Medico.findByPk(dadosAtualizacao.id_medico);
          if (!medico) {
            return res.status(404).json({
              status: 'error',
              message: 'Médico não encontrado'
            });
          }
        }
        
        // Verificar se já existe outra consulta para o mesmo médico no mesmo horário
        const consultaExistente = await Consulta.findOne({
          where: {
            id_consulta: { [Op.ne]: id },
            id_medico: dadosAtualizacao.id_medico || consulta.id_medico,
            data_consulta: dadosAtualizacao.data_consulta 
              ? new Date(dadosAtualizacao.data_consulta) 
              : consulta.data_consulta,
            status: {
              [Op.ne]: 'Cancelada'
            }
          }
        });

        if (consultaExistente) {
          return res.status(409).json({
            status: 'error',
            message: 'Já existe uma consulta agendada para este médico neste horário'
          });
        }
      }

      // Verificar se está alterando o paciente
      if (dadosAtualizacao.id_paciente && dadosAtualizacao.id_paciente !== consulta.id_paciente) {
        const paciente = await Paciente.findByPk(dadosAtualizacao.id_paciente);
        if (!paciente) {
          return res.status(404).json({
            status: 'error',
            message: 'Paciente não encontrado'
          });
        }
      }

      // Atualizar a consulta
      await consulta.update(dadosAtualizacao);

      // Buscar a consulta atualizada com os dados relacionados
      const consultaAtualizada = await Consulta.findByPk(id, {
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] },
          { model: Medico, attributes: ['id_medico', 'nome', 'crm', 'especialidade'] }
        ]
      });

      return res.status(200).json({
        status: 'success',
        message: 'Consulta atualizada com sucesso',
        data: consultaAtualizada
      });
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar consulta',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Excluir uma consulta
  excluirConsulta: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se a consulta existe
      const consulta = await Consulta.findByPk(id);
      if (!consulta) {
        return res.status(404).json({
          status: 'error',
          message: 'Consulta não encontrada'
        });
      }

      // Excluir a consulta
      await consulta.destroy();

      return res.status(200).json({
        status: 'success',
        message: 'Consulta excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir consulta:', error);
      
      // Verificar se o erro é de restrição de chave estrangeira
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({
          status: 'error',
          message: 'Não é possível excluir a consulta pois ela possui registros associados'
        });
      }
      
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao excluir consulta',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = consultaController;


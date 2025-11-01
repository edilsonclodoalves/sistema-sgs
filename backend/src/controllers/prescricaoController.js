const { Prescricao, Paciente, Consulta, Medico } = require('../models');

const prescricaoController = {
  // Listar todas as prescrições
  listarPrescricoes: async (req, res) => {
    try {
      const { page = 1, limit = 10, id_paciente, id_consulta } = req.query;
      const offset = (page - 1) * limit;
      
      // Construir filtros
      const where = {};
      
      if (id_paciente) {
        where.id_paciente = id_paciente;
      }
      
      if (id_consulta) {
        where.id_consulta = id_consulta;
      }
      
      // Buscar prescrições com paginação e filtros
      const { count, rows: prescricoes } = await Prescricao.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_prescricao', 'DESC']],
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] },
          { 
            model: Consulta, 
            attributes: ['id_consulta', 'data_consulta', 'status'],
            include: [
              { model: Medico, attributes: ['id_medico', 'nome', 'crm', 'especialidade'] }
            ]
          }
        ]
      });

      return res.status(200).json({
        status: 'success',
        message: 'Prescrições listadas com sucesso',
        data: {
          prescricoes,
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar prescrições:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao listar prescrições',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obter uma prescrição pelo ID
  obterPrescricao: async (req, res) => {
    try {
      const { id } = req.params;
      
      const prescricao = await Prescricao.findByPk(id, {
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] },
          { 
            model: Consulta, 
            attributes: ['id_consulta', 'data_consulta', 'status'],
            include: [
              { model: Medico, attributes: ['id_medico', 'nome', 'crm', 'especialidade'] }
            ]
          }
        ]
      });
      
      if (!prescricao) {
        return res.status(404).json({
          status: 'error',
          message: 'Prescrição não encontrada'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Prescrição encontrada com sucesso',
        data: prescricao
      });
    } catch (error) {
      console.error('Erro ao obter prescrição:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao obter prescrição',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Criar uma nova prescrição
  criarPrescricao: async (req, res) => {
    try {
      const { id_consulta, id_paciente, medicamento, dosagem, instrucoes, data_prescricao } = req.body;
      
      // Validar dados obrigatórios
      if (!id_consulta || !id_paciente || !medicamento || !dosagem || !instrucoes) {
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

      // Verificar se a consulta existe
      const consulta = await Consulta.findByPk(id_consulta);
      if (!consulta) {
        return res.status(404).json({
          status: 'error',
          message: 'Consulta não encontrada'
        });
      }

      // Verificar se o paciente da consulta é o mesmo informado
      if (consulta.id_paciente !== parseInt(id_paciente)) {
        return res.status(400).json({
          status: 'error',
          message: 'O paciente informado não corresponde ao paciente da consulta'
        });
      }

      // Criar a prescrição
      const novaPrescricao = await Prescricao.create({
        id_consulta,
        id_paciente,
        medicamento,
        dosagem,
        instrucoes,
        data_prescricao: data_prescricao || new Date()
      });

      // Buscar a prescrição com os dados relacionados
      const prescricaoCompleta = await Prescricao.findByPk(novaPrescricao.id_prescricao, {
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] },
          { 
            model: Consulta, 
            attributes: ['id_consulta', 'data_consulta', 'status'],
            include: [
              { model: Medico, attributes: ['id_medico', 'nome', 'crm', 'especialidade'] }
            ]
          }
        ]
      });

      return res.status(201).json({
        status: 'success',
        message: 'Prescrição criada com sucesso',
        data: prescricaoCompleta
      });
    } catch (error) {
      console.error('Erro ao criar prescrição:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao criar prescrição',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Atualizar uma prescrição existente
  atualizarPrescricao: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_consulta, id_paciente, medicamento, dosagem, instrucoes, data_prescricao } = req.body;
      
      // Validar dados obrigatórios
      if (!id_consulta || !id_paciente || !medicamento || !dosagem || !instrucoes) {
        return res.status(400).json({
          status: 'error',
          message: 'Dados obrigatórios não fornecidos'
        });
      }

      // Verificar se a prescrição existe
      const prescricao = await Prescricao.findByPk(id);
      if (!prescricao) {
        return res.status(404).json({
          status: 'error',
          message: 'Prescrição não encontrada'
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

      // Verificar se a consulta existe
      const consulta = await Consulta.findByPk(id_consulta);
      if (!consulta) {
        return res.status(404).json({
          status: 'error',
          message: 'Consulta não encontrada'
        });
      }

      // Verificar se o paciente da consulta é o mesmo informado
      if (consulta.id_paciente !== parseInt(id_paciente)) {
        return res.status(400).json({
          status: 'error',
          message: 'O paciente informado não corresponde ao paciente da consulta'
        });
      }

      // Atualizar a prescrição
      await prescricao.update({
        id_consulta,
        id_paciente,
        medicamento,
        dosagem,
        instrucoes,
        data_prescricao: data_prescricao || prescricao.data_prescricao
      });

      // Buscar a prescrição atualizada com os dados relacionados
      const prescricaoAtualizada = await Prescricao.findByPk(id, {
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] },
          { 
            model: Consulta, 
            attributes: ['id_consulta', 'data_consulta', 'status'],
            include: [
              { model: Medico, attributes: ['id_medico', 'nome', 'crm', 'especialidade'] }
            ]
          }
        ]
      });

      return res.status(200).json({
        status: 'success',
        message: 'Prescrição atualizada com sucesso',
        data: prescricaoAtualizada
      });
    } catch (error) {
      console.error('Erro ao atualizar prescrição:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar prescrição',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Atualizar parcialmente uma prescrição
  atualizarParcialPrescricao: async (req, res) => {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;
      
      // Verificar se a prescrição existe
      const prescricao = await Prescricao.findByPk(id);
      if (!prescricao) {
        return res.status(404).json({
          status: 'error',
          message: 'Prescrição não encontrada'
        });
      }

      // Verificar se está alterando a consulta ou o paciente
      if (dadosAtualizacao.id_consulta || dadosAtualizacao.id_paciente) {
        // Verificar se o paciente existe
        if (dadosAtualizacao.id_paciente) {
          const paciente = await Paciente.findByPk(dadosAtualizacao.id_paciente);
          if (!paciente) {
            return res.status(404).json({
              status: 'error',
              message: 'Paciente não encontrado'
            });
          }
        }

        // Verificar se a consulta existe
        if (dadosAtualizacao.id_consulta) {
          const consulta = await Consulta.findByPk(dadosAtualizacao.id_consulta);
          if (!consulta) {
            return res.status(404).json({
              status: 'error',
              message: 'Consulta não encontrada'
            });
          }

          // Verificar se o paciente da consulta é o mesmo informado ou o mesmo da prescrição
          const id_paciente_verificar = dadosAtualizacao.id_paciente || prescricao.id_paciente;
          if (consulta.id_paciente !== parseInt(id_paciente_verificar)) {
            return res.status(400).json({
              status: 'error',
              message: 'O paciente informado não corresponde ao paciente da consulta'
            });
          }
        }
      }

      // Atualizar a prescrição
      await prescricao.update(dadosAtualizacao);

      // Buscar a prescrição atualizada com os dados relacionados
      const prescricaoAtualizada = await Prescricao.findByPk(id, {
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] },
          { 
            model: Consulta, 
            attributes: ['id_consulta', 'data_consulta', 'status'],
            include: [
              { model: Medico, attributes: ['id_medico', 'nome', 'crm', 'especialidade'] }
            ]
          }
        ]
      });

      return res.status(200).json({
        status: 'success',
        message: 'Prescrição atualizada com sucesso',
        data: prescricaoAtualizada
      });
    } catch (error) {
      console.error('Erro ao atualizar prescrição:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar prescrição',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Excluir uma prescrição
  excluirPrescricao: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se a prescrição existe
      const prescricao = await Prescricao.findByPk(id);
      if (!prescricao) {
        return res.status(404).json({
          status: 'error',
          message: 'Prescrição não encontrada'
        });
      }

      // Excluir a prescrição
      await prescricao.destroy();

      return res.status(200).json({
        status: 'success',
        message: 'Prescrição excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir prescrição:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao excluir prescrição',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = prescricaoController;


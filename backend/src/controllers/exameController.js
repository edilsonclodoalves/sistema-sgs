const { Exame, Paciente, Consulta, Medico } = require('../models');

const exameController = {
  // Listar todos os exames
  listarExames: async (req, res) => {
    try {
      const { page = 1, limit = 10, id_paciente, id_consulta, status } = req.query;
      const offset = (page - 1) * limit;
      
      // Construir filtros
      const where = {};
      
      if (id_paciente) {
        where.id_paciente = id_paciente;
      }
      
      if (id_consulta) {
        where.id_consulta = id_consulta;
      }
      
      if (status) {
        where.status = status;
      }
      
      // Buscar exames com paginação e filtros
      const { count, rows: exames } = await Exame.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_solicitacao', 'DESC']],
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
        message: 'Exames listados com sucesso',
        data: {
          exames,
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar exames:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao listar exames',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obter um exame pelo ID
  obterExame: async (req, res) => {
    try {
      const { id } = req.params;
      
      const exame = await Exame.findByPk(id, {
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
      
      if (!exame) {
        return res.status(404).json({
          status: 'error',
          message: 'Exame não encontrado'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Exame encontrado com sucesso',
        data: exame
      });
    } catch (error) {
      console.error('Erro ao obter exame:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao obter exame',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Criar um novo exame
  criarExame: async (req, res) => {
    try {
      const { id_consulta, id_paciente, tipo_exame, data_solicitacao, resultado, status } = req.body;
      
      // Validar dados obrigatórios
      if (!id_consulta || !id_paciente || !tipo_exame) {
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

      // Criar o exame
      const novoExame = await Exame.create({
        id_consulta,
        id_paciente,
        tipo_exame,
        data_solicitacao: data_solicitacao || new Date(),
        resultado,
        status: status || 'Solicitado'
      });

      // Buscar o exame com os dados relacionados
      const exameCompleto = await Exame.findByPk(novoExame.id_exame, {
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
        message: 'Exame criado com sucesso',
        data: exameCompleto
      });
    } catch (error) {
      console.error('Erro ao criar exame:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao criar exame',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Atualizar um exame existente
  atualizarExame: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_consulta, id_paciente, tipo_exame, data_solicitacao, resultado, status } = req.body;
      
      // Validar dados obrigatórios
      if (!id_consulta || !id_paciente || !tipo_exame) {
        return res.status(400).json({
          status: 'error',
          message: 'Dados obrigatórios não fornecidos'
        });
      }

      // Verificar se o exame existe
      const exame = await Exame.findByPk(id);
      if (!exame) {
        return res.status(404).json({
          status: 'error',
          message: 'Exame não encontrado'
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

      // Atualizar o exame
      await exame.update({
        id_consulta,
        id_paciente,
        tipo_exame,
        data_solicitacao: data_solicitacao || exame.data_solicitacao,
        resultado,
        status: status || exame.status
      });

      // Buscar o exame atualizado com os dados relacionados
      const exameAtualizado = await Exame.findByPk(id, {
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
        message: 'Exame atualizado com sucesso',
        data: exameAtualizado
      });
    } catch (error) {
      console.error('Erro ao atualizar exame:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar exame',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Atualizar parcialmente um exame
  atualizarParcialExame: async (req, res) => {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;
      
      // Verificar se o exame existe
      const exame = await Exame.findByPk(id);
      if (!exame) {
        return res.status(404).json({
          status: 'error',
          message: 'Exame não encontrado'
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

          // Verificar se o paciente da consulta é o mesmo informado ou o mesmo do exame
          const id_paciente_verificar = dadosAtualizacao.id_paciente || exame.id_paciente;
          if (consulta.id_paciente !== parseInt(id_paciente_verificar)) {
            return res.status(400).json({
              status: 'error',
              message: 'O paciente informado não corresponde ao paciente da consulta'
            });
          }
        }
      }

      // Atualizar o exame
      await exame.update(dadosAtualizacao);

      // Buscar o exame atualizado com os dados relacionados
      const exameAtualizado = await Exame.findByPk(id, {
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
        message: 'Exame atualizado com sucesso',
        data: exameAtualizado
      });
    } catch (error) {
      console.error('Erro ao atualizar exame:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar exame',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Excluir um exame
  excluirExame: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o exame existe
      const exame = await Exame.findByPk(id);
      if (!exame) {
        return res.status(404).json({
          status: 'error',
          message: 'Exame não encontrado'
        });
      }

      // Excluir o exame
      await exame.destroy();

      return res.status(200).json({
        status: 'success',
        message: 'Exame excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir exame:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao excluir exame',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = exameController;


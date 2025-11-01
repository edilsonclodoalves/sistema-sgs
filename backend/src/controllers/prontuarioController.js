const { Prontuario, Paciente } = require('../models');

const prontuarioController = {
  // Listar todos os prontuários
  listarProntuarios: async (req, res) => {
    try {
      const { page = 1, limit = 10, id_paciente } = req.query;
      const offset = (page - 1) * limit;
      
      // Construir filtros
      const where = {};
      
      if (id_paciente) {
        where.id_paciente = id_paciente;
      }
      
      // Buscar prontuários com paginação e filtros
      const { count, rows: prontuarios } = await Prontuario.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_registro', 'DESC']],
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] }
        ]
      });

      return res.status(200).json({
        status: 'success',
        message: 'Prontuários listados com sucesso',
        data: {
          prontuarios,
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar prontuários:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao listar prontuários',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obter um prontuário pelo ID
  obterProntuario: async (req, res) => {
    try {
      const { id } = req.params;
      
      const prontuario = await Prontuario.findByPk(id, {
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] }
        ]
      });
      
      if (!prontuario) {
        return res.status(404).json({
          status: 'error',
          message: 'Prontuário não encontrado'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Prontuário encontrado com sucesso',
        data: prontuario
      });
    } catch (error) {
      console.error('Erro ao obter prontuário:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao obter prontuário',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Criar um novo prontuário
  criarProntuario: async (req, res) => {
    try {
      const { id_paciente, diagnostico, observacoes } = req.body;
      
      // Validar dados obrigatórios
      if (!id_paciente || !diagnostico) {
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

      // Criar o prontuário
      const novoProntuario = await Prontuario.create({
        id_paciente,
        diagnostico,
        observacoes,
        data_registro: new Date()
      });

      // Buscar o prontuário com os dados relacionados
      const prontuarioCompleto = await Prontuario.findByPk(novoProntuario.id_prontuario, {
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] }
        ]
      });

      return res.status(201).json({
        status: 'success',
        message: 'Prontuário criado com sucesso',
        data: prontuarioCompleto
      });
    } catch (error) {
      console.error('Erro ao criar prontuário:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao criar prontuário',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Atualizar um prontuário existente
  atualizarProntuario: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_paciente, diagnostico, observacoes } = req.body;
      
      // Validar dados obrigatórios
      if (!id_paciente || !diagnostico) {
        return res.status(400).json({
          status: 'error',
          message: 'Dados obrigatórios não fornecidos'
        });
      }

      // Verificar se o prontuário existe
      const prontuario = await Prontuario.findByPk(id);
      if (!prontuario) {
        return res.status(404).json({
          status: 'error',
          message: 'Prontuário não encontrado'
        });
      }

      // Verificar se o paciente existe
      if (id_paciente !== prontuario.id_paciente) {
        const paciente = await Paciente.findByPk(id_paciente);
        if (!paciente) {
          return res.status(404).json({
            status: 'error',
            message: 'Paciente não encontrado'
          });
        }
      }

      // Atualizar o prontuário
      await prontuario.update({
        id_paciente,
        diagnostico,
        observacoes
      });

      // Buscar o prontuário atualizado com os dados relacionados
      const prontuarioAtualizado = await Prontuario.findByPk(id, {
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] }
        ]
      });

      return res.status(200).json({
        status: 'success',
        message: 'Prontuário atualizado com sucesso',
        data: prontuarioAtualizado
      });
    } catch (error) {
      console.error('Erro ao atualizar prontuário:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar prontuário',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Excluir um prontuário
  excluirProntuario: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o prontuário existe
      const prontuario = await Prontuario.findByPk(id);
      if (!prontuario) {
        return res.status(404).json({
          status: 'error',
          message: 'Prontuário não encontrado'
        });
      }

      // Excluir o prontuário
      await prontuario.destroy();

      return res.status(200).json({
        status: 'success',
        message: 'Prontuário excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir prontuário:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao excluir prontuário',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = prontuarioController;


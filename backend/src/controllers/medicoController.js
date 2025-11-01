const { Medico } = require('../models');

const medicoController = {
  // Listar todos os médicos
  listarMedicos: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const { count, rows: medicos } = await Medico.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nome', 'ASC']]
      });

      return res.status(200).json({
        status: 'success',
        message: 'Médicos listados com sucesso',
        data: {
          medicos,
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar médicos:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao listar médicos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obter um médico pelo ID
  obterMedico: async (req, res) => {
    try {
      const { id } = req.params;
      
      const medico = await Medico.findByPk(id);
      
      if (!medico) {
        return res.status(404).json({
          status: 'error',
          message: 'Médico não encontrado'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Médico encontrado com sucesso',
        data: medico
      });
    } catch (error) {
      console.error('Erro ao obter médico:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao obter médico',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Criar um novo médico
  criarMedico: async (req, res) => {
    try {
      const { nome, crm, especialidade, telefone, email } = req.body;
      
      // Validar dados obrigatórios
      if (!nome || !crm || !especialidade || !telefone) {
        return res.status(400).json({
          status: 'error',
          message: 'Dados obrigatórios não fornecidos'
        });
      }

      // Verificar se já existe um médico com o mesmo CRM
      const medicoExistente = await Medico.findOne({ where: { crm } });
      if (medicoExistente) {
        return res.status(409).json({
          status: 'error',
          message: 'Já existe um médico com este CRM'
        });
      }

      // Criar o médico
      const novoMedico = await Medico.create({
        nome,
        crm,
        especialidade,
        telefone,
        email
      });

      return res.status(201).json({
        status: 'success',
        message: 'Médico criado com sucesso',
        data: novoMedico
      });
    } catch (error) {
      console.error('Erro ao criar médico:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao criar médico',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Atualizar um médico existente
  atualizarMedico: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, crm, especialidade, telefone, email } = req.body;
      
      // Validar dados obrigatórios
      if (!nome || !crm || !especialidade || !telefone) {
        return res.status(400).json({
          status: 'error',
          message: 'Dados obrigatórios não fornecidos'
        });
      }

      // Verificar se o médico existe
      const medico = await Medico.findByPk(id);
      if (!medico) {
        return res.status(404).json({
          status: 'error',
          message: 'Médico não encontrado'
        });
      }

      // Verificar se o CRM já está em uso por outro médico
      if (crm !== medico.crm) {
        const medicoExistente = await Medico.findOne({ where: { crm } });
        if (medicoExistente) {
          return res.status(409).json({
            status: 'error',
            message: 'Já existe um médico com este CRM'
          });
        }
      }

      // Verificar permissão (médico só pode atualizar seus próprios dados)
      if (req.userRole === 'medico' && req.userId !== medico.id_medico) {
        return res.status(403).json({
          status: 'error',
          message: 'Você não tem permissão para atualizar dados de outro médico'
        });
      }

      // Atualizar o médico
      await medico.update({
        nome,
        crm,
        especialidade,
        telefone,
        email
      });

      return res.status(200).json({
        status: 'success',
        message: 'Médico atualizado com sucesso',
        data: medico
      });
    } catch (error) {
      console.error('Erro ao atualizar médico:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar médico',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Atualizar parcialmente um médico
  atualizarParcialMedico: async (req, res) => {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;
      
      // Verificar se o médico existe
      const medico = await Medico.findByPk(id);
      if (!medico) {
        return res.status(404).json({
          status: 'error',
          message: 'Médico não encontrado'
        });
      }

      // Verificar permissão (médico só pode atualizar seus próprios dados)
      if (req.userRole === 'medico' && req.userId !== medico.id_medico) {
        return res.status(403).json({
          status: 'error',
          message: 'Você não tem permissão para atualizar dados de outro médico'
        });
      }

      // Verificar se o CRM está sendo atualizado e já está em uso
      if (dadosAtualizacao.crm && dadosAtualizacao.crm !== medico.crm) {
        const medicoExistente = await Medico.findOne({ 
          where: { crm: dadosAtualizacao.crm } 
        });
        
        if (medicoExistente) {
          return res.status(409).json({
            status: 'error',
            message: 'Já existe um médico com este CRM'
          });
        }
      }

      // Atualizar o médico
      await medico.update(dadosAtualizacao);

      return res.status(200).json({
        status: 'success',
        message: 'Médico atualizado com sucesso',
        data: medico
      });
    } catch (error) {
      console.error('Erro ao atualizar médico:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar médico',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Excluir um médico
  excluirMedico: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o médico existe
      const medico = await Medico.findByPk(id);
      if (!medico) {
        return res.status(404).json({
          status: 'error',
          message: 'Médico não encontrado'
        });
      }

      // Excluir o médico
      await medico.destroy();

      return res.status(200).json({
        status: 'success',
        message: 'Médico excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir médico:', error);
      
      // Verificar se o erro é de restrição de chave estrangeira
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({
          status: 'error',
          message: 'Não é possível excluir o médico pois ele possui registros associados'
        });
      }
      
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao excluir médico',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = medicoController;


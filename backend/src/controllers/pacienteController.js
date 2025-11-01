const { Paciente } = require('../models');

const pacienteController = {
  // Listar todos os pacientes
  listarPacientes: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const { count, rows: pacientes } = await Paciente.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nome', 'ASC']]
      });

      return res.status(200).json({
        status: 'success',
        message: 'Pacientes listados com sucesso',
        data: {
          pacientes,
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar pacientes:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao listar pacientes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obter um paciente pelo ID
  obterPaciente: async (req, res) => {
    try {
      const { id } = req.params;
      
      const paciente = await Paciente.findByPk(id);
      
      if (!paciente) {
        return res.status(404).json({
          status: 'error',
          message: 'Paciente não encontrado'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Paciente encontrado com sucesso',
        data: paciente
      });
    } catch (error) {
      console.error('Erro ao obter paciente:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao obter paciente',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Criar um novo paciente
  criarPaciente: async (req, res) => {
    try {
      const { nome, cpf, data_nascimento, telefone, email, endereco } = req.body;
      
      // Validar dados obrigatórios
      if (!nome || !cpf || !data_nascimento || !telefone) {
        return res.status(400).json({
          status: 'error',
          message: 'Dados obrigatórios não fornecidos'
        });
      }

      // Verificar se já existe um paciente com o mesmo CPF
      const pacienteExistente = await Paciente.findOne({ where: { cpf } });
      if (pacienteExistente) {
        return res.status(409).json({
          status: 'error',
          message: 'Já existe um paciente com este CPF'
        });
      }

      // Criar o paciente
      const novoPaciente = await Paciente.create({
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        endereco
      });

      return res.status(201).json({
        status: 'success',
        message: 'Paciente criado com sucesso',
        data: novoPaciente
      });
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao criar paciente',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Atualizar um paciente existente
  atualizarPaciente: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, cpf, data_nascimento, telefone, email, endereco } = req.body;
      
      // Validar dados obrigatórios
      if (!nome || !cpf || !data_nascimento || !telefone) {
        return res.status(400).json({
          status: 'error',
          message: 'Dados obrigatórios não fornecidos'
        });
      }

      // Verificar se o paciente existe
      const paciente = await Paciente.findByPk(id);
      if (!paciente) {
        return res.status(404).json({
          status: 'error',
          message: 'Paciente não encontrado'
        });
      }

      // Verificar se o CPF já está em uso por outro paciente
      if (cpf !== paciente.cpf) {
        const pacienteExistente = await Paciente.findOne({ where: { cpf } });
        if (pacienteExistente) {
          return res.status(409).json({
            status: 'error',
            message: 'Já existe um paciente com este CPF'
          });
        }
      }

      // Atualizar o paciente
      await paciente.update({
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        endereco
      });

      return res.status(200).json({
        status: 'success',
        message: 'Paciente atualizado com sucesso',
        data: paciente
      });
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar paciente',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Atualizar parcialmente um paciente
  atualizarParcialPaciente: async (req, res) => {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;
      
      // Verificar se o paciente existe
      const paciente = await Paciente.findByPk(id);
      if (!paciente) {
        return res.status(404).json({
          status: 'error',
          message: 'Paciente não encontrado'
        });
      }

      // Verificar se o CPF está sendo atualizado e já está em uso
      if (dadosAtualizacao.cpf && dadosAtualizacao.cpf !== paciente.cpf) {
        const pacienteExistente = await Paciente.findOne({ 
          where: { cpf: dadosAtualizacao.cpf } 
        });
        
        if (pacienteExistente) {
          return res.status(409).json({
            status: 'error',
            message: 'Já existe um paciente com este CPF'
          });
        }
      }

      // Atualizar o paciente
      await paciente.update(dadosAtualizacao);

      return res.status(200).json({
        status: 'success',
        message: 'Paciente atualizado com sucesso',
        data: paciente
      });
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar paciente',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Excluir um paciente
  excluirPaciente: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o paciente existe
      const paciente = await Paciente.findByPk(id);
      if (!paciente) {
        return res.status(404).json({
          status: 'error',
          message: 'Paciente não encontrado'
        });
      }

      // Excluir o paciente
      await paciente.destroy();

      return res.status(200).json({
        status: 'success',
        message: 'Paciente excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      
      // Verificar se o erro é de restrição de chave estrangeira
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({
          status: 'error',
          message: 'Não é possível excluir o paciente pois ele possui registros associados'
        });
      }
      
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao excluir paciente',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = pacienteController;


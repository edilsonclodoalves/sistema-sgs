const { Paciente, Pessoa, Usuario, Consulta, Prontuario, Exame } = require('../models');
const { Op } = require('sequelize');

class PacienteController {
  /**
   * Listar todos os pacientes
   * GET /api/pacientes
   */
  async index(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '',
        ativo = 'true'
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};
      
      if (search) {
        where[Op.or] = [
          { '$pessoa.nome_completo$': { [Op.like]: `%${search}%` } },
          { '$pessoa.cpf$': { [Op.like]: `%${search}%` } },
          { '$pessoa.email$': { [Op.like]: `%${search}%` } },
          { numero_prontuario: { [Op.like]: `%${search}%` } }
        ];
      }

      if (ativo !== 'all') {
        where['$pessoa.ativo$'] = ativo === 'true';
      }

      const { count, rows: pacientes } = await Paciente.findAndCountAll({
        where,
        include: [{
          model: Pessoa,
          as: 'pessoa',
          attributes: { exclude: ['createdAt', 'updatedAt'] }
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        distinct: true
      });

      return res.json({
        pacientes,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Erro ao listar pacientes:', error);
      return res.status(500).json({
        error: 'Erro ao listar pacientes',
        message: error.message
      });
    }
  }

  /**
   * Buscar paciente por ID
   * GET /api/pacientes/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const paciente = await Paciente.findByPk(id, {
        include: [
          {
            model: Pessoa,
            as: 'pessoa'
          },
          {
            model: Consulta,
            as: 'consultas',
            limit: 5,
            order: [['data_hora', 'DESC']],
            separate: true
          }
        ]
      });

      if (!paciente) {
        return res.status(404).json({
          error: 'Paciente não encontrado',
          message: 'Não existe paciente com este ID'
        });
      }

      // Buscar estatísticas
      const totalConsultas = await Consulta.count({ where: { paciente_id: id } });
      const consultasRealizadas = await Consulta.count({ 
        where: { paciente_id: id, status: 'REALIZADA' } 
      });
      const totalExames = await Exame.count({ where: { paciente_id: id } });

      return res.json({
        paciente,
        estatisticas: {
          total_consultas: totalConsultas,
          consultas_realizadas: consultasRealizadas,
          total_exames: totalExames
        }
      });

    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
      return res.status(500).json({
        error: 'Erro ao buscar paciente',
        message: error.message
      });
    }
  }

  /**
   * Criar novo paciente
   * POST /api/pacientes
   */
  async store(req, res) {
    try {
      const {
        // Dados da pessoa
        cpf, nome_completo, data_nascimento, sexo, email,
        telefone, celular, cep, logradouro, numero, complemento,
        bairro, cidade, estado, foto_perfil,
        // Dados do paciente
        tipo_sanguineo, alergias, medicamentos_uso, observacoes,
        convenio, numero_carteirinha
      } = req.body;

      // Validações básicas
      if (!cpf || !nome_completo || !data_nascimento || !sexo || !email) {
        return res.status(400).json({
          error: 'Dados incompletos',
          message: 'CPF, nome, data de nascimento, sexo e email são obrigatórios'
        });
      }

      // ✅ Verificar se CPF já existe
      const cpfExistente = await Pessoa.findOne({ where: { cpf } });
      if (cpfExistente) {
        return res.status(400).json({
          error: 'CPF já cadastrado',
          message: 'Já existe uma pessoa cadastrada com este CPF'
        });
      }

      // ✅ Verificar se EMAIL já existe
      const emailExistente = await Pessoa.findOne({ where: { email } });
      if (emailExistente) {
        return res.status(400).json({
          error: 'Email já cadastrado',
          message: 'Já existe uma pessoa cadastrada com este email'
        });
      }

      // Criar pessoa
      const pessoa = await Pessoa.create({
        cpf, nome_completo, data_nascimento, sexo, email,
        telefone, celular, cep, logradouro, numero, complemento,
        bairro, cidade, estado, foto_perfil,
        ativo: true
      });

      // Gerar número de prontuário
      const ultimoPaciente = await Paciente.findOne({
        order: [['id', 'DESC']]
      });
      const proximoNumero = ultimoPaciente ? ultimoPaciente.id + 1 : 1;
      const numeroProntuario = `PRON-${String(proximoNumero).padStart(6, '0')}`;

      // Criar paciente
      const paciente = await Paciente.create({
        pessoa_id: pessoa.id,
        numero_prontuario: numeroProntuario,
        tipo_sanguineo,
        alergias,
        medicamentos_uso,
        observacoes,
        convenio,
        numero_carteirinha
      });

      // ✅ SEMPRE criar usuário para o paciente
      // Senha é a data de nascimento (será hasheada automaticamente pelo hook do modelo Usuario)
      await Usuario.create({
        pessoa_id: pessoa.id,
        email: email,
        senha: data_nascimento, // Data de nascimento no formato YYYY-MM-DD
        perfil: 'PACIENTE',
        ativo: true
      });

      // Recarregar com relacionamentos
      const pacienteCriado = await Paciente.findByPk(paciente.id, {
        include: [{
          model: Pessoa,
          as: 'pessoa'
        }]
      });

      return res.status(201).json({
        message: 'Paciente cadastrado com sucesso',
        paciente: pacienteCriado
      });

    } catch (error) {
      console.error('Erro ao criar paciente:', error);

      // ✅ Tratamento específico para erros de constraint única (backup)
      if (error.name === 'SequelizeUniqueConstraintError') {
        const campo = error.errors[0]?.path || 'desconhecido';
        
        let mensagem = 'Já existe um registro com esse valor';
        if (campo === 'cpf') {
          mensagem = 'CPF já cadastrado no sistema';
        } else if (campo === 'email') {
          mensagem = 'Email já cadastrado no sistema';
        }

        return res.status(400).json({
          error: mensagem,
          campo: campo
        });
      }

      // ✅ Tratamento para erros de validação
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
        error: 'Erro ao criar paciente',
        message: error.message
      });
    }
  }

  /**
   * Atualizar paciente
   * PUT /api/pacientes/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      const paciente = await Paciente.findByPk(id, {
        include: [{ model: Pessoa, as: 'pessoa' }]
      });

      if (!paciente) {
        return res.status(404).json({
          error: 'Paciente não encontrado',
          message: 'Não existe paciente com este ID'
        });
      }

      // Atualizar dados da pessoa
      if (dados.pessoa) {
        await paciente.pessoa.update(dados.pessoa);
      }

      // Atualizar dados do paciente
      await paciente.update({
        tipo_sanguineo: dados.tipo_sanguineo,
        alergias: dados.alergias,
        medicamentos_uso: dados.medicamentos_uso,
        observacoes: dados.observacoes,
        convenio: dados.convenio,
        numero_carteirinha: dados.numero_carteirinha
      });

      // Recarregar
      const pacienteAtualizado = await Paciente.findByPk(id, {
        include: [{ model: Pessoa, as: 'pessoa' }]
      });

      return res.json({
        message: 'Paciente atualizado com sucesso',
        paciente: pacienteAtualizado
      });

    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar paciente',
        message: error.message
      });
    }
  }

  /**
   * Desativar paciente
   * DELETE /api/pacientes/:id
   */
  async destroy(req, res) {
    try {
      const { id } = req.params;

      const paciente = await Paciente.findByPk(id, {
        include: [{ model: Pessoa, as: 'pessoa' }]
      });

      if (!paciente) {
        return res.status(404).json({
          error: 'Paciente não encontrado',
          message: 'Não existe paciente com este ID'
        });
      }

      // Desativar ao invés de deletar
      await paciente.pessoa.update({ ativo: false });

      return res.json({
        message: 'Paciente desativado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao desativar paciente:', error);
      return res.status(500).json({
        error: 'Erro ao desativar paciente',
        message: error.message
      });
    }
  }

  /**
   * Histórico médico do paciente
   * GET /api/pacientes/:id/historico
   */
  async historico(req, res) {
    try {
      const { id } = req.params;
      const { permanente } = req.query;

      const paciente = await Paciente.findByPk(id, {
        include: [{ model: Pessoa, as: 'pessoa' }]
      });

      if (!paciente) {
        return res.status(404).json({
          error: 'Paciente não encontrado',
          message: 'Não existe paciente com este ID'
        });
      }

      // Se pediu exclusão permanente, executar remoção completa (apenas ADMIN)
      if (permanente === 'true') {
        if (req.userPerfil !== 'ADMINISTRADOR') {
          return res.status(403).json({
            error: 'Acesso negado',
            message: 'Apenas administradores podem excluir registros permanentemente'
          });
        }

        const transaction = await Paciente.sequelize.transaction();
        try {
          // Remover dados relacionados primeiro
          await Consulta.destroy({ where: { paciente_id: paciente.id }, transaction });
          await Exame.destroy({ where: { paciente_id: paciente.id }, transaction });
          await Prontuario.destroy({ where: { paciente_id: paciente.id }, transaction });

          // Remover usuário, paciente e pessoa
          await Usuario.destroy({ where: { pessoa_id: paciente.pessoa.id }, transaction });
          await Paciente.destroy({ where: { id: paciente.id }, transaction });
          await Pessoa.destroy({ where: { id: paciente.pessoa.id }, transaction });

          await transaction.commit();

          return res.json({
            message: 'Paciente excluído permanentemente'
          });
        } catch (err) {
          await transaction.rollback();
          throw err;
        }
      }

      // Desativar ao invés de deletar (comportamento padrão)
      await paciente.pessoa.update({ ativo: false });

      return res.json({
        message: 'Paciente desativado com sucesso'
      });

      const exames = await Exame.findAll({
        where: { paciente_id: id },
        order: [['data_solicitacao', 'DESC']]
      });

      return res.json({
        consultas,
        exames
      });

    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return res.status(500).json({
        error: 'Erro ao buscar histórico',
        message: error.message
      });
    }
  }
}

module.exports = new PacienteController();
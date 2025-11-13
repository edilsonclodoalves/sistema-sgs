const { Medico, Pessoa, Usuario, Consulta } = require('../models');
const { Op } = require('sequelize');

class MedicoController {
  /**
   * Listar todos os médicos
   * GET /api/medicos
   */
  async index(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '',
        especialidade = '',
        ativo = 'true'
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};
      
      if (search) {
        where[Op.or] = [
          { '$pessoa.nome_completo$': { [Op.like]: `%${search}%` } },
          { '$pessoa.cpf$': { [Op.like]: `%${search}%` } },
          { crm: { [Op.like]: `%${search}%` } }
        ];
      }

      if (especialidade) {
        where.especialidade = { [Op.like]: `%${especialidade}%` };
      }

      if (ativo !== 'all') {
        where['$pessoa.ativo$'] = ativo === 'true';
      }

      const { count, rows: medicos } = await Medico.findAndCountAll({
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
        medicos,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Erro ao listar médicos:', error);
      return res.status(500).json({
        error: 'Erro ao listar médicos',
        message: error.message
      });
    }
  }

  /**
   * Buscar médico por ID
   * GET /api/medicos/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const medico = await Medico.findByPk(id, {
        include: [
          {
            model: Pessoa,
            as: 'pessoa'
          },
          {
            model: Consulta,
            as: 'consultas',
            limit: 10,
            order: [['data_hora', 'DESC']],
            separate: true
          }
        ]
      });

      if (!medico) {
        return res.status(404).json({
          error: 'Médico não encontrado',
          message: 'Não existe médico com este ID'
        });
      }

      // Buscar estatísticas
      const totalConsultas = await Consulta.count({ where: { medico_id: id } });
      const consultasRealizadas = await Consulta.count({ 
        where: { medico_id: id, status: 'REALIZADA' } 
      });

      return res.json({
        medico,
        estatisticas: {
          total_consultas: totalConsultas,
          consultas_realizadas: consultasRealizadas
        }
      });

    } catch (error) {
      console.error('Erro ao buscar médico:', error);
      return res.status(500).json({
        error: 'Erro ao buscar médico',
        message: error.message
      });
    }
  }

  /**
   * Criar novo médico
   * POST /api/medicos
   */
  async store(req, res) {
    try {
      const {
        // Dados da pessoa
        cpf, nome_completo, data_nascimento, sexo, email,
        telefone, celular, cep, logradouro, numero, complemento,
        bairro, cidade, estado, foto_perfil,
        // Dados do médico
        crm, crm_uf, especialidade, sub_especialidade,
        conselho_regional, valor_consulta, agenda_padrao,
        // Credenciais (opcional)
        criar_usuario = false, senha
      } = req.body;

      // Validações básicas
      if (!cpf || !nome_completo || !email || !crm || !crm_uf || !especialidade) {
        return res.status(400).json({
          error: 'Dados incompletos',
          message: 'CPF, nome, email, CRM, UF do CRM e especialidade são obrigatórios'
        });
      }

      // Verificar se CPF já existe
      const cpfExistente = await Pessoa.findOne({ where: { cpf } });
      if (cpfExistente) {
        return res.status(400).json({
          error: 'CPF já cadastrado',
          message: 'Já existe uma pessoa cadastrada com este CPF'
        });
      }

      // Verificar se EMAIL já existe
      const emailExistente = await Pessoa.findOne({ where: { email } });
      if (emailExistente) {
        return res.status(400).json({
          error: 'Email já cadastrado',
          message: 'Já existe uma pessoa cadastrada com este email'
        });
      }

      // Verificar se CRM já existe
      const crmExistente = await Medico.findOne({ 
        where: { crm, crm_uf } 
      });
      if (crmExistente) {
        return res.status(400).json({
          error: 'CRM já cadastrado',
          message: 'Já existe um médico cadastrado com este CRM/UF'
        });
      }

      // Criar pessoa
      const pessoa = await Pessoa.create({
        cpf, 
        nome_completo, 
        data_nascimento: data_nascimento || '1980-01-01', 
        sexo: sexo || 'M', 
        email,
        telefone, 
        celular, 
        cep, 
        logradouro, 
        numero, 
        complemento,
        bairro, 
        cidade, 
        estado, 
        foto_perfil,
        ativo: true
      });

      // Criar médico
      const medico = await Medico.create({
        pessoa_id: pessoa.id,
        crm,
        crm_uf,
        especialidade,
        sub_especialidade,
        conselho_regional: conselho_regional || 'CRM',
        valor_consulta,
        agenda_padrao
      });

      // Criar usuário se solicitado
      if (criar_usuario && senha) {
        await Usuario.create({
          pessoa_id: pessoa.id,
          email: email,
          senha: senha,
          perfil: 'MEDICO',
          ativo: true
        });
      }

      // Recarregar com relacionamentos
      const medicoCriado = await Medico.findByPk(medico.id, {
        include: [{
          model: Pessoa,
          as: 'pessoa'
        }]
      });

      return res.status(201).json({
        message: 'Médico cadastrado com sucesso',
        medico: medicoCriado
      });

    } catch (error) {
      console.error('Erro ao criar médico:', error);

      // Tratamento específico para erros de constraint única
      if (error.name === 'SequelizeUniqueConstraintError') {
        const campo = error.errors[0]?.path || 'desconhecido';
        
        let mensagem = 'Já existe um registro com esse valor';
        if (campo === 'cpf') {
          mensagem = 'CPF já cadastrado no sistema';
        } else if (campo === 'email') {
          mensagem = 'Email já cadastrado no sistema';
        } else if (campo === 'crm') {
          mensagem = 'CRM já cadastrado no sistema';
        }

        return res.status(400).json({
          error: mensagem,
          campo: campo
        });
      }

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
        error: 'Erro ao criar médico',
        message: error.message
      });
    }
  }

  /**
   * Atualizar médico
   * PUT /api/medicos/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      const medico = await Medico.findByPk(id, {
        include: [{ model: Pessoa, as: 'pessoa' }]
      });

      if (!medico) {
        return res.status(404).json({
          error: 'Médico não encontrado',
          message: 'Não existe médico com este ID'
        });
      }

      // Atualizar dados da pessoa
      if (dados.pessoa) {
        await medico.pessoa.update(dados.pessoa);
      }

      // Atualizar dados do médico
      await medico.update({
        crm: dados.crm,
        crm_uf: dados.crm_uf,
        especialidade: dados.especialidade,
        sub_especialidade: dados.sub_especialidade,
        conselho_regional: dados.conselho_regional,
        valor_consulta: dados.valor_consulta,
        agenda_padrao: dados.agenda_padrao
      });

      // Recarregar
      const medicoAtualizado = await Medico.findByPk(id, {
        include: [{ model: Pessoa, as: 'pessoa' }]
      });

      return res.json({
        message: 'Médico atualizado com sucesso',
        medico: medicoAtualizado
      });

    } catch (error) {
      console.error('Erro ao atualizar médico:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar médico',
        message: error.message
      });
    }
  }

  /**
   * Desativar médico
   * DELETE /api/medicos/:id
   */
  async destroy(req, res) {
    try {
      const { id } = req.params;

      const medico = await Medico.findByPk(id, {
        include: [{ model: Pessoa, as: 'pessoa' }]
      });

      if (!medico) {
        return res.status(404).json({
          error: 'Médico não encontrado',
          message: 'Não existe médico com este ID'
        });
      }

      // Desativar ao invés de deletar
      await medico.pessoa.update({ ativo: false });

      return res.json({
        message: 'Médico desativado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao desativar médico:', error);
      return res.status(500).json({
        error: 'Erro ao desativar médico',
        message: error.message
      });
    }
  }

  /**
   * Agenda do médico
   * GET /api/medicos/:id/agenda
   */
  async agenda(req, res) {
    try {
      const { id } = req.params;
      const { data_inicio, data_fim } = req.query;

      const medico = await Medico.findByPk(id);
      if (!medico) {
        return res.status(404).json({
          error: 'Médico não encontrado'
        });
      }

      const where = { medico_id: id };
      
      if (data_inicio && data_fim) {
        where.data_hora = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      const consultas = await Consulta.findAll({
        where,
        include: [
          {
            model: Medico,
            as: 'medico',
            include: [{ model: Pessoa, as: 'pessoa' }]
          }
        ],
        order: [['data_hora', 'ASC']]
      });

      return res.json({
        consultas
      });

    } catch (error) {
      console.error('Erro ao buscar agenda:', error);
      return res.status(500).json({
        error: 'Erro ao buscar agenda',
        message: error.message
      });
    }
  }

  /**
   * Especialidades disponíveis
   * GET /api/medicos/especialidades
   */
  async especialidades(req, res) {
    try {
      const especialidades = await Medico.findAll({
        attributes: ['especialidade'],
        group: ['especialidade'],
        where: {
          '$pessoa.ativo$': true
        },
        include: [{
          model: Pessoa,
          as: 'pessoa',
          attributes: []
        }]
      });

      const lista = especialidades.map(m => m.especialidade).filter(Boolean);

      return res.json({
        especialidades: lista
      });

    } catch (error) {
      console.error('Erro ao buscar especialidades:', error);
      return res.status(500).json({
        error: 'Erro ao buscar especialidades',
        message: error.message
      });
    }
  }
}

module.exports = new MedicoController();

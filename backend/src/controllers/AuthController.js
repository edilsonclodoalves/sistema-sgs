const jwt = require('jsonwebtoken');
const { Usuario, Pessoa, Paciente } = require('../models');

class AuthController {
  /**
   * Login de usuário do sistema (email e senha)
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Validar dados
      if (!email || !senha) {
        return res.status(400).json({
          error: 'Dados incompletos',
          message: 'Email e senha são obrigatórios'
        });
      }

      // Buscar usuário
      const usuario = await Usuario.findOne({
        where: { email },
        include: [{
          model: Pessoa,
          as: 'pessoa',
          attributes: ['id', 'nome_completo', 'cpf', 'email', 'telefone', 'foto_perfil']
        }]
      });

      if (!usuario) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        });
      }

      // Verificar se usuário está ativo
      if (!usuario.ativo) {
        return res.status(403).json({
          error: 'Usuário inativo',
          message: 'Sua conta está inativa. Entre em contato com o administrador'
        });
      }

      // Verificar se está bloqueado
      if (usuario.bloqueado_ate && new Date() < usuario.bloqueado_ate) {
        const minutosRestantes = Math.ceil((usuario.bloqueado_ate - new Date()) / 60000);
        return res.status(403).json({
          error: 'Usuário bloqueado',
          message: `Conta bloqueada temporariamente. Tente novamente em ${minutosRestantes} minutos`,
          bloqueado_ate: usuario.bloqueado_ate
        });
      }

      // Validar senha
      const senhaValida = await usuario.validarSenha(senha);

      if (!senhaValida) {
        // Incrementar tentativas de login
        const tentativas = usuario.tentativas_login + 1;
        
        if (tentativas >= 5) {
          // Bloquear por 15 minutos após 5 tentativas
          const bloqueadoAte = new Date();
          bloqueadoAte.setMinutes(bloqueadoAte.getMinutes() + 15);
          
          await usuario.update({
            tentativas_login: tentativas,
            bloqueado_ate: bloqueadoAte
          });

          return res.status(403).json({
            error: 'Conta bloqueada',
            message: 'Muitas tentativas de login. Conta bloqueada por 15 minutos',
            bloqueado_ate: bloqueadoAte
          });
        }

        await usuario.update({ tentativas_login: tentativas });

        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos',
          tentativas_restantes: 5 - tentativas
        });
      }

      // Login bem-sucedido - resetar tentativas e atualizar último acesso
      await usuario.update({
        tentativas_login: 0,
        bloqueado_ate: null,
        ultimo_acesso: new Date()
      });

      // Gerar token JWT
      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          perfil: usuario.perfil
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRE || '7d'
        }
      );

      // Remover senha do objeto antes de retornar
      const usuarioSemSenha = usuario.toJSON();

      return res.json({
        message: 'Login realizado com sucesso',
        token,
        usuario: usuarioSemSenha,
        perfil: usuario.perfil
      });

    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({
        error: 'Erro no servidor',
        message: 'Erro ao processar login'
      });
    }
  }

  /**
   * Login de paciente (CPF e data de nascimento)
   * POST /api/auth/login-paciente
   */
  async loginPaciente(req, res) {
    try {
      const { cpf, data_nascimento } = req.body;

      // Validar dados
      if (!cpf || !data_nascimento) {
        return res.status(400).json({
          error: 'Dados incompletos',
          message: 'CPF e data de nascimento são obrigatórios'
        });
      }

      // Buscar pessoa pelo CPF
      const pessoa = await Pessoa.findOne({
        where: { cpf }
      });

      if (!pessoa) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'CPF ou data de nascimento incorretos'
        });
      }

      // Verificar se a pessoa está ativa
      if (!pessoa.ativo) {
        return res.status(403).json({
          error: 'Acesso inativo',
          message: 'Seu cadastro está inativo. Entre em contato com a recepção'
        });
      }

      // Buscar usuário relacionado à pessoa
      const usuario = await Usuario.findOne({
        where: { 
          pessoa_id: pessoa.id,
          perfil: 'PACIENTE'
        },
        include: [{
          model: Pessoa,
          as: 'pessoa',
          attributes: ['id', 'nome_completo', 'cpf', 'email', 'telefone', 'foto_perfil', 'data_nascimento']
        }]
      });

      if (!usuario) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'CPF ou data de nascimento incorretos'
        });
      }

      // Verificar se usuário está ativo
      if (!usuario.ativo) {
        return res.status(403).json({
          error: 'Acesso inativo',
          message: 'Seu acesso está inativo. Entre em contato com a recepção'
        });
      }

      // Verificar se está bloqueado
      if (usuario.bloqueado_ate && new Date() < usuario.bloqueado_ate) {
        const minutosRestantes = Math.ceil((usuario.bloqueado_ate - new Date()) / 60000);
        return res.status(403).json({
          error: 'Acesso bloqueado',
          message: `Acesso bloqueado temporariamente. Tente novamente em ${minutosRestantes} minutos`,
          bloqueado_ate: usuario.bloqueado_ate
        });
      }

      // Validar data de nascimento (senha)
      const senhaValida = await usuario.validarSenha(data_nascimento);

      if (!senhaValida) {
        // Incrementar tentativas de login
        const tentativas = usuario.tentativas_login + 1;
        
        if (tentativas >= 5) {
          // Bloquear por 15 minutos após 5 tentativas
          const bloqueadoAte = new Date();
          bloqueadoAte.setMinutes(bloqueadoAte.getMinutes() + 15);
          
          await usuario.update({
            tentativas_login: tentativas,
            bloqueado_ate: bloqueadoAte
          });

          return res.status(403).json({
            error: 'Acesso bloqueado',
            message: 'Muitas tentativas de login. Acesso bloqueado por 15 minutos',
            bloqueado_ate: bloqueadoAte
          });
        }

        await usuario.update({ tentativas_login: tentativas });

        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'CPF ou data de nascimento incorretos',
          tentativas_restantes: 5 - tentativas
        });
      }

      // Buscar dados do paciente
      const paciente = await Paciente.findOne({
        where: { pessoa_id: pessoa.id },
        include: [{
          model: Pessoa,
          as: 'pessoa',
          attributes: ['id', 'nome_completo', 'cpf', 'email', 'telefone', 'foto_perfil', 'data_nascimento']
        }]
      });

      // Login bem-sucedido - resetar tentativas e atualizar último acesso
      await usuario.update({
        tentativas_login: 0,
        bloqueado_ate: null,
        ultimo_acesso: new Date()
      });

      // Gerar token JWT
      const token = jwt.sign(
        {
          id: usuario.id,
          pessoa_id: pessoa.id,
          cpf: pessoa.cpf,
          perfil: 'PACIENTE'
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRE || '7d'
        }
      );

      // Remover senha do objeto antes de retornar
      const usuarioSemSenha = usuario.toJSON();

      return res.json({
        message: 'Login realizado com sucesso',
        token,
        usuario: usuarioSemSenha,
        paciente: paciente,
        perfil: 'PACIENTE'
      });

    } catch (error) {
      console.error('Erro no login do paciente:', error);
      return res.status(500).json({
        error: 'Erro no servidor',
        message: 'Erro ao processar login'
      });
    }
  }

  /**
   * Retorna dados do usuário logado
   * GET /api/auth/me
   */
  async me(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.userId, {
        include: [{
          model: Pessoa,
          as: 'pessoa'
        }],
        attributes: { exclude: ['senha'] }
      });

      if (!usuario) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          message: 'Usuário não existe mais'
        });
      }

      return res.json({
        usuario: usuario.toJSON()
      });

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({
        error: 'Erro no servidor',
        message: 'Erro ao buscar dados do usuário'
      });
    }
  }

  /**
   * Atualizar senha do usuário
   * PUT /api/auth/change-password
   */
  async changePassword(req, res) {
    try {
      const { senha_atual, senha_nova, senha_nova_confirmacao } = req.body;

      // Validações
      if (!senha_atual || !senha_nova || !senha_nova_confirmacao) {
        return res.status(400).json({
          error: 'Dados incompletos',
          message: 'Todas as senhas são obrigatórias'
        });
      }

      if (senha_nova !== senha_nova_confirmacao) {
        return res.status(400).json({
          error: 'Senhas não conferem',
          message: 'A nova senha e a confirmação devem ser iguais'
        });
      }

      if (senha_nova.length < 6) {
        return res.status(400).json({
          error: 'Senha fraca',
          message: 'A senha deve ter no mínimo 6 caracteres'
        });
      }

      // Buscar usuário
      const usuario = await Usuario.findByPk(req.userId);

      // Validar senha atual
      const senhaValida = await usuario.validarSenha(senha_atual);
      if (!senhaValida) {
        return res.status(401).json({
          error: 'Senha incorreta',
          message: 'A senha atual está incorreta'
        });
      }

      // Atualizar senha
      usuario.senha = senha_nova;
      await usuario.save();

      return res.json({
        message: 'Senha alterada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return res.status(500).json({
        error: 'Erro no servidor',
        message: 'Erro ao alterar senha'
      });
    }
  }

  /**
   * Logout (opcional - pode invalidar token no frontend)
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // No JWT, o logout é feito no frontend removendo o token
      // Aqui apenas registramos a ação para auditoria
      
      return res.json({
        message: 'Logout realizado com sucesso'
      });

    } catch (error) {
      console.error('Erro no logout:', error);
      return res.status(500).json({
        error: 'Erro no servidor',
        message: 'Erro ao processar logout'
      });
    }
  }

  /**
   * Verificar se token é válido
   * GET /api/auth/verify
   */
  async verifyToken(req, res) {
    try {
      // Se chegou aqui, o middleware auth já validou o token
      return res.json({
        valid: true,
        userId: req.userId,
        perfil: req.userPerfil
      });

    } catch (error) {
      return res.status(500).json({
        error: 'Erro no servidor',
        message: 'Erro ao verificar token'
      });
    }
  }
/**
 * Registrar novo usuário do sistema (apenas admin)
 * POST /api/auth/register
 */
async register(req, res) {
  try {
    const {
      // Dados da pessoa
      cpf, nome_completo, data_nascimento, sexo, email,
      telefone, celular, cep, logradouro, numero, complemento,
      bairro, cidade, estado, foto_perfil,
      // Dados do usuário
      senha, perfil
    } = req.body;

    // Validar dados obrigatórios
    if (!cpf || !nome_completo || !data_nascimento || !sexo || !email || !senha || !perfil) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'CPF, nome, data de nascimento, sexo, email, senha e perfil são obrigatórios'
      });
    }

    // Validar perfil
    const perfisValidos = ['ADMINISTRADOR', 'GESTOR', 'MEDICO', 'RECEPCIONISTA'];
    if (!perfisValidos.includes(perfil)) {
      return res.status(400).json({
        error: 'Perfil inválido',
        message: `Perfil deve ser: ${perfisValidos.join(', ')}`
      });
    }

    // Validar senha
    if (senha.length < 6) {
      return res.status(400).json({
        error: 'Senha fraca',
        message: 'A senha deve ter no mínimo 6 caracteres'
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

    // Verificar se email já existe
    const emailExistente = await Usuario.findOne({ where: { email } });
    if (emailExistente) {
      return res.status(400).json({
        error: 'Email já cadastrado',
        message: 'Já existe um usuário cadastrado com este email'
      });
    }

    // Criar pessoa
    const pessoa = await Pessoa.create({
      cpf, nome_completo, data_nascimento, sexo, email,
      telefone, celular, cep, logradouro, numero, complemento,
      bairro, cidade, estado, foto_perfil,
      ativo: true
    });

    // Criar usuário (senha será hasheada automaticamente pelo hook)
    const usuario = await Usuario.create({
      pessoa_id: pessoa.id,
      email: email,
      senha: senha,
      perfil: perfil,
      ativo: true
    });

    // Buscar usuário completo
    const usuarioCriado = await Usuario.findByPk(usuario.id, {
      include: [{
        model: Pessoa,
        as: 'pessoa',
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }],
      attributes: { exclude: ['senha'] }
    });

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      usuario: usuarioCriado
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);

    // Tratamento de erros de validação do Sequelize
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
      error: 'Erro no servidor',
      message: 'Erro ao registrar usuário'
    });
  }
}

}

module.exports = new AuthController();

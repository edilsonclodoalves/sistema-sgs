const jwt = require('jsonwebtoken');
const { Usuario, Pessoa } = require('../models');

/**
 * Middleware de Autenticação JWT
 * Verifica token e adiciona dados do usuário à requisição
 */
const auth = async (req, res, next) => {
  try {
    // Extrair token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Token não fornecido',
        message: 'É necessário estar autenticado para acessar este recurso'
      });
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ 
        error: 'Formato de token inválido',
        message: 'Use o formato: Bearer {token}'
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ 
        error: 'Formato de token inválido',
        message: 'Token mal formatado'
      });
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário atualizado no banco
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{
        model: Pessoa,
        as: 'pessoa',
        attributes: ['id', 'nome_completo', 'email', 'cpf', 'foto_perfil']
      }],
      attributes: { exclude: ['senha'] }
    });

    if (!usuario) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado',
        message: 'Token válido mas usuário não existe mais'
      });
    }

    if (!usuario.ativo) {
      return res.status(401).json({ 
        error: 'Usuário inativo',
        message: 'Sua conta foi desativada'
      });
    }

    // Adicionar usuário à requisição
    req.userId = usuario.id;
    req.userPerfil = usuario.perfil;
    req.usuario = usuario;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'Token de autenticação inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'Seu token expirou. Faça login novamente'
      });
    }

    return res.status(500).json({ 
      error: 'Erro na autenticação',
      message: error.message 
    });
  }
};

/**
 * Middleware de Autorização por Perfil
 * Verifica se o usuário tem um dos perfis permitidos
 */
const authorize = (...perfisPermitidos) => {
  return (req, res, next) => {
    if (!req.userPerfil) {
      return res.status(401).json({ 
        error: 'Não autenticado',
        message: 'Faça login primeiro'
      });
    }

    if (!perfisPermitidos.includes(req.userPerfil)) {
      return res.status(403).json({ 
        error: 'Acesso negado',
        message: 'Você não tem permissão para acessar este recurso',
        perfilNecessario: perfisPermitidos,
        seuPerfil: req.userPerfil
      });
    }

    next();
  };
};

/**
 * Middleware opcional de autenticação
 * Adiciona dados do usuário se token estiver presente, mas não bloqueia
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return next();
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{
        model: Pessoa,
        as: 'pessoa'
      }]
    });

    if (usuario && usuario.ativo) {
      req.userId = usuario.id;
      req.userPerfil = usuario.perfil;
      req.usuario = usuario;
    }

    next();
  } catch (error) {
    // Em caso de erro, apenas prossegue sem autenticação
    next();
  }
};

module.exports = { auth, authorize, optionalAuth };

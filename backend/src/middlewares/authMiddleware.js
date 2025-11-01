const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Token não fornecido' 
    });
  }

  // Formato esperado: "Bearer TOKEN"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Erro no formato do token' 
    });
  }

  const [scheme, token] = parts;
  
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Token mal formatado' 
    });
  }

  // Verificar se o token é válido
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Token inválido' 
      });
    }

    // Se o token for válido, salva o ID do usuário para uso nas rotas
    req.userId = decoded.id;
    req.userRole = decoded.role;
    return next();
  });
};

// Middleware para verificar permissões baseadas em papéis
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        status: 'error',
        message: 'Acesso negado: você não tem permissão para acessar este recurso'
      });
    }
    return next();
  };
};

module.exports = { authMiddleware, checkRole };


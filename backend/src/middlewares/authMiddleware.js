const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Token não fornecido' 
    });
  }

  // Formato esperado: "Bearer TOKEN"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return res.status(401).json({ 
      error: 'Erro no formato do token' 
    });
  }

  const [scheme, token] = parts;
  
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ 
      error: 'Token mal formatado' 
    });
  }

  // Verificar se o token é válido
  jwt.verify(token, process.env.JWT_SECRET || 'seu-secret-muito-seguro', (err, decoded) => {
    if (err) {
      return res.status(401).json({ 
        error: 'Token inválido ou expirado' 
      });
    }

    // Se o token for válido, salva os dados do usuário para uso nas rotas
    req.user = {
      id: decoded.id,
      email: decoded.email,
      cpf: decoded.cpf,
      tipo: decoded.tipo,
      role: decoded.role
    };
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
        error: 'Acesso negado: você não tem permissão para acessar este recurso'
      });
    }
    return next();
  };
};

module.exports = { authMiddleware, checkRole };


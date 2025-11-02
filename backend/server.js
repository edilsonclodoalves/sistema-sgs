require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./src/models');

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use('/api/', limiter);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logs de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Rotas básicas (carregar apenas as que existem)
try {
  app.use('/api/auth', require('./src/routes/authRoutes'));
  console.log('✓ Rotas de autenticação carregadas');
} catch (err) {
  console.log('⚠ Rotas de autenticação não encontradas');
}

try {
  app.use('/api/pacientes', require('./src/routes/pacienteRoutes'));
  console.log('✓ Rotas de pacientes carregadas');
} catch (err) {
  console.log('⚠ Rotas de pacientes não encontradas');
}

try {
  app.use('/api/medicos', require('./src/routes/medicoRoutes'));
  console.log('✓ Rotas de médicos carregadas');
} catch (err) {
  console.log('⚠ Rotas de médicos não encontradas');
}

try {
  app.use('/api/consultas', require('./src/routes/consultaRoutes'));
  console.log('✓ Rotas de consultas carregadas');
} catch (err) {
  console.log('⚠ Rotas de consultas não encontradas');
}

try {
  app.use('/api/prontuarios', require('./src/routes/prontuarioRoutes'));
  console.log('✓ Rotas de prontuários carregadas');
} catch (err) {
  console.log('⚠ Rotas de prontuários não encontradas');
}

try {
  app.use('/api/exames', require('./src/routes/exameRoutes'));
  console.log('✓ Rotas de exames carregadas');
} catch (err) {
  console.log('⚠ Rotas de exames não encontradas');
}

try {
  app.use('/api/prescricoes', require('./src/routes/prescricaoRoutes'));
  console.log('✓ Rotas de prescrições carregadas');
} catch (err) {
  console.log('⚠ Rotas de prescrições não encontradas');
}

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'SGS - Sistema de Gestão de Saúde API',
    version: '1.0.0',
    status: 'Online',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      pacientes: '/api/pacientes',
      medicos: '/api/medicos',
      consultas: '/api/consultas',
      prontuarios: '/api/prontuarios',
      exames: '/api/exames',
      prescricoes: '/api/prescricoes'
    }
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.url,
    message: 'Verifique a documentação da API'
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(`[ERRO] ${err.message}`);
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const startServer = async () => {
  try {
    console.log('\n🚀 Iniciando SGS - Sistema de Gestão de Saúde...\n');
    
    // Testa conexão com banco de dados
    await sequelize.authenticate();
    console.log('✓ Conexão com banco de dados estabelecida com sucesso');
    
    // Sincroniza modelos (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('✓ Modelos carregados e prontos');
    }
    
    // Inicia servidor
    app.listen(PORT, HOST, () => {
      console.log('\n═══════════════════════════════════════════════════');
      console.log(`✓ Servidor rodando em http://${HOST}:${PORT}`);
      console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Health check: http://${HOST}:${PORT}/health`);
      console.log('═══════════════════════════════════════════════════\n');
    });
    
  } catch (error) {
    console.error('\n✗ Erro ao iniciar servidor:');
    console.error(`  ${error.message}\n`);
    console.error('Verificações:');
    console.error('  □ MySQL está rodando?');
    console.error('  □ Credenciais no .env estão corretas?');
    console.error('  □ Banco "sgs_clinica" foi criado?');
    console.error('  □ Modelos foram copiados corretamente?\n');
    process.exit(1);
  }
};

startServer();

module.exports = app;

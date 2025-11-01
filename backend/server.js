const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importação da configuração do banco de dados
const { initializeDatabase } = require('./src/utils/initializeDatabase');

// Importação das rotas
const pacienteRoutes = require('./src/routes/pacienteRoutes');
const medicoRoutes = require('./src/routes/medicoRoutes');
const consultaRoutes = require('./src/routes/consultaRoutes');
const prontuarioRoutes = require('./src/routes/prontuarioRoutes');
const exameRoutes = require('./src/routes/exameRoutes');
const prescricaoRoutes = require('./src/routes/prescricaoRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inicializar o banco de dados
initializeDatabase()
  .then(success => {
    if (success) {
      console.log('Banco de dados inicializado com sucesso.');
    } else {
      console.error('Falha ao inicializar o banco de dados.');
    }
  })
  .catch(error => {
    console.error('Erro ao inicializar o banco de dados:', error);
  });

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API da Clínica Médica funcionando!' });
});

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/medicos", medicoRoutes);
app.use("/api/consultas", consultaRoutes);
app.use("/api/prontuarios", prontuarioRoutes);
app.use("/api/exames", exameRoutes);
app.use("/api/prescricoes", prescricaoRoutes);

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Rota não encontrada'
  });
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;


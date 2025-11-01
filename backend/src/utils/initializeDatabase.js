const { sequelize, syncModels } = require('../models');

// Função para inicializar o banco de dados
const initializeDatabase = async () => {
  try {
    // Testar a conexão com o banco de dados
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    // Sincronizar os modelos com o banco de dados
    await syncModels(false); // false para não forçar a recriação das tabelas
    console.log('Modelos sincronizados com o banco de dados.');

    return true;
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    return false;
  }
};

module.exports = { initializeDatabase };


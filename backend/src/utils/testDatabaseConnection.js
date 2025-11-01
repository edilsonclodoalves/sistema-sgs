const { sequelize } = require('../config/database');

// Testar a conexão com o banco de dados
const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    return false;
  } finally {
    // Fechar a conexão
    await sequelize.close();
    console.log('Conexão com o banco de dados fechada.');
  }
};

// Executar o teste
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('Teste de conexão com o banco de dados concluído com sucesso.');
      process.exit(0);
    } else {
      console.error('Teste de conexão com o banco de dados falhou.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Erro durante o teste de conexão:', error);
    process.exit(1);
  });


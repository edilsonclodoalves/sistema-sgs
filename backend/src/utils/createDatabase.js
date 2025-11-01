const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  try {
    // Conectar ao MySQL sem especificar um banco de dados
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS
    });

    console.log('Conectado ao MySQL com sucesso!');

    // Criar o banco de dados se não existir
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Banco de dados '${process.env.DB_NAME}' criado ou já existente.`);

    // Fechar a conexão
    await connection.end();
    console.log('Conexão fechada.');

    console.log('Processo de criação do banco de dados concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar o banco de dados:', error);
    process.exit(1);
  }
}

// Executar a função
createDatabase();


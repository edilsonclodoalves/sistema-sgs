#!/usr/bin/env node

/**
 * Script de Setup Completo do Banco de Dados SGS
 * 
 * Este script:
 * 1. Cria o banco de dados se não existir
 * 2. Cria todas as tabelas
 * 3. Insere dados iniciais (seed)
 * 4. Valida a estrutura
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { sequelize } = require('../src/models');
const bcrypt = require('bcryptjs');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '═'.repeat(70));
  log(`  ${title}`, 'cyan');
  console.log('═'.repeat(70) + '\n');
}

async function createDatabase() {
  logSection('ETAPA 1: Criando Banco de Dados');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    const dbName = process.env.DB_NAME || 'sgs_clinica';
    
    log(`Verificando banco de dados "${dbName}"...`, 'yellow');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    log(`✓ Banco de dados "${dbName}" criado/verificado com sucesso`, 'green');
    
    await connection.end();
    return true;
  } catch (error) {
    log(`✗ Erro ao criar banco de dados: ${error.message}`, 'red');
    await connection.end();
    throw error;
  }
}

async function createTables() {
  logSection('ETAPA 2: Criando Tabelas');
  
  try {
    log('Testando conexão com o banco...', 'yellow');
    await sequelize.authenticate();
    log('✓ Conexão estabelecida com sucesso', 'green');
    
    log('\nSincronizando modelos com o banco de dados...', 'yellow');
    await sequelize.sync({ force: true }); // force: true recria todas as tabelas
    log('✓ Todas as tabelas criadas com sucesso', 'green');
    
    // Listar tabelas criadas
    const [tables] = await sequelize.query("SHOW TABLES");
    log('\n📋 Tabelas criadas:', 'blue');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      log(`   ✓ ${tableName}`, 'green');
    });
    
    return true;
  } catch (error) {
    log(`✗ Erro ao criar tabelas: ${error.message}`, 'red');
    throw error;
  }
}

async function seedDatabase() {
  logSection('ETAPA 3: Inserindo Dados Iniciais');
  
  try {
    const { Pessoa, Usuario, Medico, Paciente } = require('../src/models');
    
    // 1. Criar pessoa administrador
    log('Criando usuário administrador...', 'yellow');
    const pessoaAdmin = await Pessoa.create({
      cpf: '00000000000',
      nome_completo: 'Administrador do Sistema',
      data_nascimento: '1990-01-01',
      sexo: 'M',
      email: 'admin@sgs.com',
      telefone: '31999999999',
      celular: '31999999999',
      cep: '30000000',
      logradouro: 'Rua Administração',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Pedro Leopoldo',
      estado: 'MG',
      ativo: true
    });

    const usuarioAdmin = await Usuario.create({
      pessoa_id: pessoaAdmin.id,
      email: 'admin@sgs.com',
      senha: 'admin123', // Será hasheada automaticamente pelo hook
      perfil: 'ADMINISTRADOR',
      ativo: true
    });
    log('✓ Administrador criado: admin@sgs.com / admin123', 'green');

    // 2. Criar médico exemplo
    log('\nCriando médico exemplo...', 'yellow');
    const pessoaMedico = await Pessoa.create({
      cpf: '11111111111',
      nome_completo: 'Dr. João Silva',
      data_nascimento: '1985-05-15',
      sexo: 'M',
      email: 'joao.silva@sgs.com',
      telefone: '31988888888',
      celular: '31988888888',
      cep: '30000000',
      logradouro: 'Av. Médicos',
      numero: '200',
      bairro: 'Centro',
      cidade: 'Pedro Leopoldo',
      estado: 'MG',
      ativo: true
    });

    const usuarioMedico = await Usuario.create({
      pessoa_id: pessoaMedico.id,
      email: 'joao.silva@sgs.com',
      senha: 'medico123',
      perfil: 'MEDICO',
      ativo: true
    });

    const medico = await Medico.create({
      pessoa_id: pessoaMedico.id,
      crm: '123456',
      crm_uf: 'MG',
      especialidade: 'Clínico Geral',
      valor_consulta: 150.00
    });
    log('✓ Médico criado: joao.silva@sgs.com / medico123', 'green');

    // 3. Criar paciente exemplo
    log('\nCriando paciente exemplo...', 'yellow');
    const pessoaPaciente = await Pessoa.create({
      cpf: '22222222222',
      nome_completo: 'Maria Santos',
      data_nascimento: '1995-08-20',
      sexo: 'F',
      email: 'maria.santos@email.com',
      telefone: '31977777777',
      celular: '31977777777',
      cep: '30000000',
      logradouro: 'Rua Pacientes',
      numero: '300',
      bairro: 'Centro',
      cidade: 'Pedro Leopoldo',
      estado: 'MG',
      ativo: true
    });

    const usuarioPaciente = await Usuario.create({
      pessoa_id: pessoaPaciente.id,
      email: 'maria.santos@email.com',
      senha: 'paciente123',
      perfil: 'PACIENTE',
      ativo: true
    });

    const paciente = await Paciente.create({
      pessoa_id: pessoaPaciente.id,
      numero_prontuario: 'PRON-001',
      tipo_sanguineo: 'O+',
      alergias: 'Nenhuma alergia conhecida',
      convenio: 'Particular'
    });
    log('✓ Paciente criado: maria.santos@email.com / paciente123', 'green');

    // 4. Criar recepcionista exemplo
    log('\nCriando recepcionista exemplo...', 'yellow');
    const pessoaRecep = await Pessoa.create({
      cpf: '33333333333',
      nome_completo: 'Ana Costa',
      data_nascimento: '1992-03-10',
      sexo: 'F',
      email: 'ana.costa@sgs.com',
      telefone: '31966666666',
      celular: '31966666666',
      cep: '30000000',
      logradouro: 'Rua Recepção',
      numero: '400',
      bairro: 'Centro',
      cidade: 'Pedro Leopoldo',
      estado: 'MG',
      ativo: true
    });

    const usuarioRecep = await Usuario.create({
      pessoa_id: pessoaRecep.id,
      email: 'ana.costa@sgs.com',
      senha: 'recep123',
      perfil: 'RECEPCIONISTA',
      ativo: true
    });
    log('✓ Recepcionista criado: ana.costa@sgs.com / recep123', 'green');

    return true;
  } catch (error) {
    log(`✗ Erro ao inserir dados iniciais: ${error.message}`, 'red');
    throw error;
  }
}

async function validateDatabase() {
  logSection('ETAPA 4: Validando Estrutura do Banco');
  
  try {
    const { Pessoa, Usuario, Medico, Paciente, Consulta } = require('../src/models');
    
    const pessoas = await Pessoa.count();
    const usuarios = await Usuario.count();
    const medicos = await Medico.count();
    const pacientes = await Paciente.count();
    const consultas = await Consulta.count();
    
    log('📊 Estatísticas do banco:', 'blue');
    log(`   Pessoas cadastradas: ${pessoas}`, 'green');
    log(`   Usuários cadastrados: ${usuarios}`, 'green');
    log(`   Médicos cadastrados: ${medicos}`, 'green');
    log(`   Pacientes cadastrados: ${pacientes}`, 'green');
    log(`   Consultas agendadas: ${consultas}`, 'green');
    
    return true;
  } catch (error) {
    log(`✗ Erro na validação: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  console.clear();
  console.log('\n' + '╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(68) + '║');
  log('║     🏥 SETUP COMPLETO DO BANCO DE DADOS - SGS v1.0              ║', 'cyan');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('╚' + '═'.repeat(68) + '╝\n');

  log('⚠️  ATENÇÃO: Este script irá RECRIAR todas as tabelas!', 'yellow');
  log('   Todos os dados existentes serão PERDIDOS!\n', 'yellow');

  try {
    await createDatabase();
    await createTables();
    await seedDatabase();
    await validateDatabase();
    
    logSection('✅ SETUP CONCLUÍDO COM SUCESSO!');
    
    log('Credenciais de acesso criadas:', 'blue');
    log('\n👤 Administrador:', 'cyan');
    log('   Email: admin@sgs.com', 'green');
    log('   Senha: admin123', 'green');
    
    log('\n👨‍⚕️ Médico:', 'cyan');
    log('   Email: joao.silva@sgs.com', 'green');
    log('   Senha: medico123', 'green');
    
    log('\n🏥 Paciente:', 'cyan');
    log('   Email: maria.santos@email.com', 'green');
    log('   Senha: paciente123', 'green');
    
    log('\n📋 Recepcionista:', 'cyan');
    log('   Email: ana.costa@sgs.com', 'green');
    log('   Senha: recep123', 'green');
    
    log('\n🚀 Próximo passo: Execute "npm run dev" para iniciar o servidor\n', 'blue');
    
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    logSection('❌ ERRO NO SETUP');
    log(error.stack, 'red');
    log('\n💡 Verifique:', 'yellow');
    log('   1. MySQL está rodando?', 'yellow');
    log('   2. Credenciais no .env estão corretas?', 'yellow');
    log('   3. Usuário tem permissão para criar databases?', 'yellow');
    
    await sequelize.close();
    process.exit(1);
  }
}

main();

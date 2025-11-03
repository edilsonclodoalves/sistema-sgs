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

    // ✅ Senha do paciente é a data de nascimento (será hasheada automaticamente)
    const usuarioPaciente = await Usuario.create({
      pessoa_id: pessoaPaciente.id,
      email: 'maria.santos@email.com',
      senha: '1995-08-20', // Data de nascimento no formato YYYY-MM-DD
      perfil: 'PACIENTE',
      ativo: true
    });

    const paciente = await Paciente.create({
      pessoa_id: pessoaPaciente.id,
      numero_prontuario: 'PRON-000001',
      tipo_sanguineo: 'O+',
      alergias: 'Nenhuma alergia conhecida',
    });
    log('✓ Paciente criado: CPF 22222222222 / Data nascimento: 1995-08-20', 'green');

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

    // 5. Criar mais pacientes exemplo
    log('\nCriando pacientes adicionais...', 'yellow');
    
    const pessoaPaciente2 = await Pessoa.create({
      cpf: '44444444444',
      nome_completo: 'Carlos Oliveira',
      data_nascimento: '1988-12-05',
      sexo: 'M',
      email: 'carlos.oliveira@email.com',
      telefone: '31955555555',
      celular: '31955555555',
      cep: '30000000',
      logradouro: 'Rua das Flores',
      numero: '500',
      bairro: 'Centro',
      cidade: 'Pedro Leopoldo',
      estado: 'MG',
      ativo: true
    });

    await Usuario.create({
      pessoa_id: pessoaPaciente2.id,
      email: 'carlos.oliveira@email.com',
      senha: '1988-12-05', // Data de nascimento
      perfil: 'PACIENTE',
      ativo: true
    });

    await Paciente.create({
      pessoa_id: pessoaPaciente2.id,
      numero_prontuario: 'PRON-000002',
      tipo_sanguineo: 'A+',
      alergias: 'Penicilina',
    });

    const pessoaPaciente3 = await Pessoa.create({
      cpf: '55555555555',
      nome_completo: 'Fernanda Lima',
      data_nascimento: '2000-06-15',
      sexo: 'F',
      email: 'fernanda.lima@email.com',
      telefone: '31944444444',
      celular: '31944444444',
      cep: '30000000',
      logradouro: 'Av. Principal',
      numero: '600',
      bairro: 'Centro',
      cidade: 'Pedro Leopoldo',
      estado: 'MG',
      ativo: true
    });

    await Usuario.create({
      pessoa_id: pessoaPaciente3.id,
      email: 'fernanda.lima@email.com',
      senha: '2000-06-15', // Data de nascimento
      perfil: 'PACIENTE',
      ativo: true
    });

    await Paciente.create({
      pessoa_id: pessoaPaciente3.id,
      numero_prontuario: 'PRON-000003',
      tipo_sanguineo: 'B+',
    });
    
    log('✓ 3 pacientes criados com sucesso', 'green');

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
    
    log('\n👤 ADMINISTRADOR:', 'cyan');
    log('   Rota: POST /api/auth/login', 'yellow');
    log('   Email: admin@sgs.com', 'green');
    log('   Senha: admin123', 'green');
    
    log('\n👨‍⚕️ MÉDICO:', 'cyan');
    log('   Rota: POST /api/auth/login', 'yellow');
    log('   Email: joao.silva@sgs.com', 'green');
    log('   Senha: medico123', 'green');
    
    log('\n📋 RECEPCIONISTA:', 'cyan');
    log('   Rota: POST /api/auth/login', 'yellow');
    log('   Email: ana.costa@sgs.com', 'green');
    log('   Senha: recep123', 'green');
    
    log('\n🏥 PACIENTES:', 'cyan');
    log('   Rota: POST /api/auth/login-paciente', 'yellow');
    log('\n   Paciente 1 - Maria Santos:', 'blue');
    log('   CPF: 22222222222', 'green');
    log('   Data de Nascimento: 1995-08-20', 'green');
    log('\n   Paciente 2 - Carlos Oliveira:', 'blue');
    log('   CPF: 44444444444', 'green');
    log('   Data de Nascimento: 1988-12-05', 'green');
    log('\n   Paciente 3 - Fernanda Lima:', 'blue');
    log('   CPF: 55555555555', 'green');
    log('   Data de Nascimento: 2000-06-15', 'green');
    
    log('\n📝 Observações Importantes:', 'yellow');
    log('   • Usuários do sistema (admin, médico, recepcionista) usam /api/auth/login', 'yellow');
    log('   • Pacientes usam /api/auth/login-paciente com CPF e data de nascimento', 'yellow');
    log('   • A senha do paciente é sempre a data de nascimento no formato YYYY-MM-DD', 'yellow');
    
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
#!/usr/bin/env node

/**
 * Script de Setup Completo do Banco de Dados SGS
 * 
 * Este script:
 * 1. Cria o banco de dados se não existir
 * 2. Cria todas as tabelas
 * 3. Insere dados iniciais (seed) incluindo histórico médico completo
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
    const { Pessoa, Usuario, Medico, Paciente, Consulta, Prontuario, Prescricao, Exame } = require('../src/models');
    
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
      senha: 'admin123',
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

    // 3. Criar segundo médico (Cardiologista)
    log('\nCriando segundo médico (Cardiologista)...', 'yellow');
    const pessoaMedico2 = await Pessoa.create({
      cpf: '66666666666',
      nome_completo: 'Dra. Ana Cardoso',
      data_nascimento: '1988-03-20',
      sexo: 'F',
      email: 'ana.cardoso@sgs.com',
      telefone: '31987777777',
      celular: '31987777777',
      cep: '30000000',
      logradouro: 'Av. Saúde',
      numero: '500',
      bairro: 'Centro',
      cidade: 'Pedro Leopoldo',
      estado: 'MG',
      ativo: true
    });

    const usuarioMedico2 = await Usuario.create({
      pessoa_id: pessoaMedico2.id,
      email: 'ana.cardoso@sgs.com',
      senha: 'medico123',
      perfil: 'MEDICO',
      ativo: true
    });

    const medico2 = await Medico.create({
      pessoa_id: pessoaMedico2.id,
      crm: '654321',
      crm_uf: 'MG',
      especialidade: 'Cardiologia',
      valor_consulta: 200.00
    });
    log('✓ Cardiologista criada: ana.cardoso@sgs.com / medico123', 'green');

    // 4. Criar paciente Maria Santos
    log('\nCriando paciente Maria Santos...', 'yellow');
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
      senha: '1995-08-20',
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

    // 5. Criar recepcionista exemplo
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

    // 6. Criar mais pacientes exemplo
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
      senha: '1988-12-05',
      perfil: 'PACIENTE',
      ativo: true
    });

    const paciente2 = await Paciente.create({
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
      senha: '2000-06-15',
      perfil: 'PACIENTE',
      ativo: true
    });

    const paciente3 = await Paciente.create({
      pessoa_id: pessoaPaciente3.id,
      numero_prontuario: 'PRON-000003',
      tipo_sanguineo: 'B+',
    });
    
    log('✓ 3 pacientes criados com sucesso', 'green');

    // ========================================
    // HISTÓRICO MÉDICO - CONSULTAS REALIZADAS
    // ========================================
    log('\n📋 Criando histórico médico do paciente Maria Santos...', 'cyan');

    // Consulta 1 - Consulta Clínica (3 meses atrás)
    log('  ➤ Consulta 1 - Clínico Geral (3 meses atrás)...', 'yellow');
    const dataConsulta1 = new Date();
    dataConsulta1.setMonth(dataConsulta1.getMonth() - 3);
    
    const consulta1 = await Consulta.create({
      paciente_id: paciente.id,
      medico_id: medico.id,
      data_hora: dataConsulta1,
      duracao_minutos: 30,
      tipo: 'CONSULTA',
      status: 'REALIZADA',
      observacoes: 'Paciente compareceu pontualmente. Consulta de rotina.',
      valor: 150.00
    });

    const prontuario1 = await Prontuario.create({
      consulta_id: consulta1.id,
      paciente_id: paciente.id,
      medico_id: medico.id,
      queixa_principal: 'Dor de cabeça frequente e cansaço excessivo',
      historia_doenca: 'Paciente relata cefaleia há 2 semanas, predominantemente vespertina. Nega febre, náuseas ou vômitos. Relata também cansaço excessivo mesmo após repouso adequado.',
      exame_fisico: 'Paciente em bom estado geral, corado, hidratado, anictérico. PA: 130/85 mmHg, FC: 78 bpm, Tax: 36.5°C. Ausculta cardiopulmonar sem alterações. Abdome flácido, indolor à palpação.',
      diagnostico: 'Cefaleia tensional e possível anemia',
      cid: 'G44.2',
      conduta: 'Solicitado hemograma completo. Prescrito analgésico para cefaleia. Orientações sobre hidratação e alimentação balanceada. Retorno em 15 dias com resultado dos exames.',
      observacoes: 'Paciente orientada sobre sinais de alerta. Demonstrou boa compreensão das orientações.'
    });

    // Prescrições da Consulta 1
    await Prescricao.create({
      prontuario_id: prontuario1.id,
      paciente_id: paciente.id,
      medico_id: medico.id,
      data_hora: dataConsulta1,
      medicamento: 'Paracetamol',
      dosagem: '750mg',
      via_administracao: 'Oral',
      frequencia: '8 em 8 horas',
      duracao: '5 dias',
      observacoes: 'Tomar após as refeições. Não exceder 3g por dia.'
    });

    await Prescricao.create({
      prontuario_id: prontuario1.id,
      paciente_id: paciente.id,
      medico_id: medico.id,
      data_hora: dataConsulta1,
      medicamento: 'Sulfato Ferroso',
      dosagem: '40mg',
      via_administracao: 'Oral',
      frequencia: '1 vez ao dia',
      duracao: '30 dias',
      observacoes: 'Tomar em jejum ou antes do café da manhã. Pode causar escurecimento das fezes.'
    });

    // Exame solicitado na Consulta 1
    await Exame.create({
      paciente_id: paciente.id,
      medico_solicitante_id: medico.id,
      tipo_exame: 'Hemograma Completo',
      data_solicitacao: dataConsulta1,
      data_realizacao: new Date(dataConsulta1.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 dias depois
      resultado: 'Hemácias: 3.8 milhões/mm³ (VR: 4.5-5.5), Hemoglobina: 10.2 g/dL (VR: 12-16), Hematócrito: 32% (VR: 36-48), Leucócitos: 7.200/mm³, Plaquetas: 280.000/mm³. Conclusão: Anemia leve.',
      status: 'REALIZADO',
      observacoes: 'Confirma anemia ferropriva leve'
    });

    log('    ✓ Consulta 1 criada com prontuário, 2 prescrições e 1 exame', 'green');

    // Consulta 2 - Retorno (2 meses atrás)
    log('  ➤ Consulta 2 - Retorno Clínico (2 meses atrás)...', 'yellow');
    const dataConsulta2 = new Date();
    dataConsulta2.setMonth(dataConsulta2.getMonth() - 2);
    dataConsulta2.setDate(15);
    
    const consulta2 = await Consulta.create({
      paciente_id: paciente.id,
      medico_id: medico.id,
      data_hora: dataConsulta2,
      duracao_minutos: 20,
      tipo: 'RETORNO',
      status: 'REALIZADA',
      observacoes: 'Retorno para avaliação de exames e resposta ao tratamento',
      valor: 100.00
    });

    const prontuario2 = await Prontuario.create({
      consulta_id: consulta2.id,
      paciente_id: paciente.id,
      medico_id: medico.id,
      queixa_principal: 'Retorno - avaliação de tratamento',
      historia_doenca: 'Paciente retorna para avaliação. Relata melhora significativa da cefaleia após início do tratamento. Ainda apresenta cansaço, porém menos intenso.',
      exame_fisico: 'BEG, corada+/4, hidratada, anictérica. PA: 125/80 mmHg, FC: 72 bpm. Exame cardiovascular e respiratório sem alterações.',
      diagnostico: 'Anemia ferropriva em tratamento - boa resposta',
      cid: 'D50.9',
      conduta: 'Manter sulfato ferroso por mais 60 dias. Orientada dieta rica em ferro. Solicitar novo hemograma de controle em 2 meses.',
      observacoes: 'Paciente aderente ao tratamento. Orientações reforçadas.'
    });

    await Prescricao.create({
      prontuario_id: prontuario2.id,
      paciente_id: paciente.id,
      medico_id: medico.id,
      data_hora: dataConsulta2,
      medicamento: 'Sulfato Ferroso',
      dosagem: '40mg',
      via_administracao: 'Oral',
      frequencia: '1 vez ao dia',
      duracao: '60 dias',
      observacoes: 'Continuar tratamento. Tomar preferencialmente em jejum.'
    });

    log('    ✓ Consulta 2 criada com prontuário e 1 prescrição', 'green');

    // Consulta 3 - Cardiologia (1 mês atrás)
    log('  ➤ Consulta 3 - Cardiologia (1 mês atrás)...', 'yellow');
    const dataConsulta3 = new Date();
    dataConsulta3.setMonth(dataConsulta3.getMonth() - 1);
    
    const consulta3 = await Consulta.create({
      paciente_id: paciente.id,
      medico_id: medico2.id,
      data_hora: dataConsulta3,
      duracao_minutos: 40,
      tipo: 'CONSULTA',
      status: 'REALIZADA',
      observacoes: 'Primeira consulta cardiológica - avaliação preventiva',
      valor: 200.00
    });

    const prontuario3 = await Prontuario.create({
      consulta_id: consulta3.id,
      paciente_id: paciente.id,
      medico_id: medico2.id,
      queixa_principal: 'Avaliação cardiológica preventiva',
      historia_doenca: 'Paciente encaminhada pelo clínico geral para avaliação cardiológica devido a PA limítrofe. Nega dor precordial, palpitações ou dispneia. Sedentária. História familiar positiva para HAS (mãe e avô).',
      exame_fisico: 'PA: 135/88 mmHg (confirmada após repouso), FC: 76 bpm regular, ausculta cardíaca: ritmo regular em 2 tempos, bulhas normofonéticas, sem sopros. Pulsos periféricos palpáveis e simétricos.',
      diagnostico: 'Pré-hipertensão arterial',
      cid: 'R03.0',
      conduta: 'Solicitado ECG, Ecocardiograma e MAPA 24h. Orientações sobre mudanças no estilo de vida: atividade física regular, dieta hipossódica, controle de peso. Retorno com exames.',
      observacoes: 'Paciente bem orientada. Demonstrou preocupação adequada e motivação para mudanças.'
    });

    // Exames solicitados na Consulta 3
    await Exame.create({
      paciente_id: paciente.id,
      medico_solicitante_id: medico2.id,
      tipo_exame: 'Eletrocardiograma (ECG)',
      data_solicitacao: dataConsulta3,
      data_realizacao: new Date(dataConsulta3.getTime() + 5 * 24 * 60 * 60 * 1000),
      resultado: 'Ritmo sinusal. FC: 72 bpm. ÂQRS: +60°. PR: 0.16s. QRS: 0.08s. QT: 0.38s. Sem alterações de repolarização ventricular. Conclusão: ECG normal.',
      status: 'REALIZADO',
      observacoes: 'Exame sem alterações significativas'
    });

    await Exame.create({
      paciente_id: paciente.id,
      medico_solicitante_id: medico2.id,
      tipo_exame: 'Ecocardiograma',
      data_solicitacao: dataConsulta3,
      data_realizacao: new Date(dataConsulta3.getTime() + 10 * 24 * 60 * 60 * 1000),
      resultado: 'Átrio esquerdo: 34mm. Ventrículo esquerdo: 48mm (diástole). Fração de ejeção: 65%. Valvas: sem alterações morfológicas. Sem sinais de hipertrofia ventricular. Conclusão: Ecocardiograma dentro dos limites da normalidade.',
      status: 'REALIZADO',
      observacoes: 'Função sistólica preservada'
    });

    await Exame.create({
      paciente_id: paciente.id,
      medico_solicitante_id: medico2.id,
      tipo_exame: 'MAPA 24 horas',
      data_solicitacao: dataConsulta3,
      status: 'AGENDADO',
      observacoes: 'Agendado para a próxima semana'
    });

    log('    ✓ Consulta 3 criada com prontuário e 3 exames', 'green');

    // ========================================
    // HISTÓRICO MÉDICO - Paciente Carlos (menos dados)
    // ========================================
    log('\n📋 Criando histórico médico do paciente Carlos Oliveira...', 'cyan');

    const dataConsultaCarlos = new Date();
    dataConsultaCarlos.setMonth(dataConsultaCarlos.getMonth() - 1);
    dataConsultaCarlos.setDate(10);

    const consultaCarlos = await Consulta.create({
      paciente_id: paciente2.id,
      medico_id: medico.id,
      data_hora: dataConsultaCarlos,
      duracao_minutos: 30,
      tipo: 'CONSULTA',
      status: 'REALIZADA',
      observacoes: 'Consulta de rotina',
      valor: 150.00
    });

    const prontuarioCarlos = await Prontuario.create({
      consulta_id: consultaCarlos.id,
      paciente_id: paciente2.id,
      medico_id: medico.id,
      queixa_principal: 'Check-up anual',
      historia_doenca: 'Paciente assintomático, comparece para check-up de rotina. Nega queixas. Pratica atividade física regularmente.',
      exame_fisico: 'BEG, PA: 120/75 mmHg, FC: 68 bpm, Tax: 36.3°C. Exames físico geral e segmentar sem alterações.',
      diagnostico: 'Paciente hígido',
      cid: 'Z00.0',
      conduta: 'Solicitados exames de rotina: hemograma, glicemia, colesterol total e frações. Manter hábitos saudáveis.',
      observacoes: 'Paciente em ótimas condições gerais'
    });

    await Exame.create({
      paciente_id: paciente2.id,
      medico_solicitante_id: medico.id,
      tipo_exame: 'Hemograma + Glicemia + Perfil Lipídico',
      data_solicitacao: dataConsultaCarlos,
      status: 'SOLICITADO',
      observacoes: 'Exames de rotina - check-up anual'
    });

    log('    ✓ Consulta criada para Carlos com prontuário e 1 exame', 'green');

    log('\n✅ Histórico médico completo criado com sucesso!', 'green');
    log('   • Maria Santos: 3 consultas, 3 prontuários, 4 prescrições, 4 exames', 'cyan');
    log('   • Carlos Oliveira: 1 consulta, 1 prontuário, 0 prescrições, 1 exame', 'cyan');

    return true;
  } catch (error) {
    log(`✗ Erro ao inserir dados iniciais: ${error.message}`, 'red');
    console.error(error);
    throw error;
  }
}

async function validateDatabase() {
  logSection('ETAPA 4: Validando Estrutura do Banco');
  
  try {
    const { Pessoa, Usuario, Medico, Paciente, Consulta, Prontuario, Prescricao, Exame } = require('../src/models');
    
    const pessoas = await Pessoa.count();
    const usuarios = await Usuario.count();
    const medicos = await Medico.count();
    const pacientes = await Paciente.count();
    const consultas = await Consulta.count();
    const prontuarios = await Prontuario.count();
    const prescricoes = await Prescricao.count();
    const exames = await Exame.count();
    
    log('📊 Estatísticas do banco:', 'blue');
    log(`   Pessoas cadastradas: ${pessoas}`, 'green');
    log(`   Usuários cadastrados: ${usuarios}`, 'green');
    log(`   Médicos cadastrados: ${medicos}`, 'green');
    log(`   Pacientes cadastrados: ${pacientes}`, 'green');
    log(`   Consultas realizadas: ${consultas}`, 'green');
    log(`   Prontuários preenchidos: ${prontuarios}`, 'green');
    log(`   Prescrições emitidas: ${prescricoes}`, 'green');
    log(`   Exames registrados: ${exames}`, 'green');
    
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
  log('║     🏥 SETUP COMPLETO DO BANCO DE DADOS - SGS v2.0              ║', 'cyan');
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
    
    log('\n👨‍⚕️ MÉDICOS:', 'cyan');
    log('   Rota: POST /api/auth/login', 'yellow');
    log('   1) Dr. João Silva (Clínico Geral):', 'blue');
    log('      Email: joao.silva@sgs.com', 'green');
    log('      Senha: medico123', 'green');
    log('   2) Dra. Ana Cardoso (Cardiologia):', 'blue');
    log('      Email: ana.cardoso@sgs.com', 'green');
    log('      Senha: medico123', 'green');
    
    log('\n📋 RECEPCIONISTA:', 'cyan');
    log('   Rota: POST /api/auth/login', 'yellow');
    log('   Email: ana.costa@sgs.com', 'green');
    log('   Senha: recep123', 'green');
    
    log('\n🏥 PACIENTES:', 'cyan');
    log('   Rota: POST /api/auth/login-paciente', 'yellow');
    log('\n   Paciente 1 - Maria Santos (COM HISTÓRICO COMPLETO):', 'blue');
    log('   CPF: 22222222222', 'green');
    log('   Data de Nascimento: 1995-08-20', 'green');
    log('   • 3 consultas realizadas', 'yellow');
    log('   • 4 prescrições registradas', 'yellow');
    log('   • 4 exames (3 realizados, 1 agendado)', 'yellow');
    log('\n   Paciente 2 - Carlos Oliveira:', 'blue');
    log('   CPF: 44444444444', 'green');
    log('   Data de Nascimento: 1988-12-05', 'green');
    log('   • 1 consulta realizada', 'yellow');
    log('   • 1 exame solicitado', 'yellow');
    log('\n   Paciente 3 - Fernanda Lima:', 'blue');
    log('   CPF: 55555555555', 'green');
    log('   Data de Nascimento: 2000-06-15', 'green');
    log('   • Sem histórico médico', 'yellow');
    
    log('\n📝 Observações Importantes:', 'yellow');
    log('   • Usuários do sistema (admin, médico, recepcionista) usam /api/auth/login', 'yellow');
    log('   • Pacientes usam /api/auth/login-paciente com CPF e data de nascimento', 'yellow');
    log('   • A senha do paciente é sempre a data de nascimento no formato YYYY-MM-DD', 'yellow');
    log('   • Maria Santos tem histórico médico completo para testes', 'yellow');
    
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
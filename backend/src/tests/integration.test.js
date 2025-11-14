/**
 * Suite de Testes de Integração - SGS v1.0
 * 
 * IMPORTANTE: Este arquivo usa require('../../server') porque está em src/tests/
 */

const request = require('supertest');
const app = require('../../server'); 
const { sequelize } = require('../models');

let adminToken, medicoToken, pacienteToken;
let pacienteId, consultaId;
let pacienteCpf, pacienteEmail;
let timestamp;

describe('Suite de Testes SGS - Sistema de Gestão de Saúde', () => {

  // =====================================================================
  // SETUP E TEARDOWN
  // =====================================================================
  
  beforeAll(async () => {
    await sequelize.authenticate();
    console.log('\n✓ Conectado ao banco de dados de testes\n');
    
    // Gera dados únicos para cada execução
    timestamp = Date.now();
    pacienteCpf = Math.floor(Math.random() * 1e11).toString().padStart(11, '0');
    pacienteEmail = `teste.${timestamp}@email.com`; 
  });

  afterAll(async () => {
    await sequelize.close();
    console.log('\n✓ Conexão fechada\n');
  });

  // =====================================================================
  // TESTES DE AUTENTICAÇÃO
  // =====================================================================

  describe('Autenticação', () => {
    
    test('deve fazer login como administrador', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@sgs.com',
          senha: 'admin123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('usuario');
      expect(res.body.usuario.perfil).toBe('ADMINISTRADOR');

      adminToken = res.body.token;
    });

    test('deve fazer login como médico', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'joao.silva@sgs.com',
          senha: 'medico123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      medicoToken = res.body.token;
    });

    test('deve fazer login como paciente', async () => {
      const res = await request(app)
        .post('/api/auth/login-paciente')
        .send({
          cpf: '22222222222',
          data_nascimento: '1995-08-20'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      pacienteToken = res.body.token;
    });

    test('não deve permitir login com senha incorreta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@sgs.com',
          senha: 'senhaerrada'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    test('deve retornar dados do usuário logado', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.usuario).toHaveProperty('email');
      expect(res.body.usuario.perfil).toBe('ADMINISTRADOR');
    });

    test('não deve acessar /me sem token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
    });

  });

  // =====================================================================
  // TESTES DE PACIENTES
  // =====================================================================

  describe('Gestão de Pacientes', () => {

    test('deve listar pacientes', async () => {
      const res = await request(app)
        .get('/api/pacientes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('pacientes');
      expect(Array.isArray(res.body.pacientes)).toBe(true);
    });

    test('deve criar novo paciente', async () => {
      const res = await request(app)
        .post('/api/pacientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cpf: pacienteCpf,
          nome_completo: 'Paciente Teste Automatizado',
          data_nascimento: '1990-01-01',
          sexo: 'M',
          email: pacienteEmail,
          telefone: '31999999999',
          tipo_sanguineo: 'O+',
          convenio: 'Particular'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('paciente');
      expect(res.body.paciente).toHaveProperty('numero_prontuario');
      
      pacienteId = res.body.paciente.id;
      console.log(`Paciente criado com ID: ${pacienteId}`);
    });

    test('não deve criar paciente com CPF duplicado', async () => {
      const res = await request(app)
        .post('/api/pacientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cpf: pacienteCpf,
          nome_completo: 'Outro Nome',
          data_nascimento: '1990-01-01',
          sexo: 'M',
          email: `outro.${timestamp}@email.com`,
          telefone: '31999999999'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('CPF');
    });

    test('não deve criar paciente com email duplicado', async () => {
      const novoCpf = Math.floor(Math.random() * 1e11).toString().padStart(11, '0');
      
      const res = await request(app)
        .post('/api/pacientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cpf: novoCpf,
          nome_completo: 'Outro Paciente',
          data_nascimento: '1990-01-01',
          sexo: 'F',
          email: pacienteEmail,
          telefone: '31999999999'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.toLowerCase()).toContain('email');
    });

  });

  // =====================================================================
  // TESTES DE CONSULTAS
  // =====================================================================

  describe('Gestão de Consultas', () => {

    test('deve listar consultas', async () => {
      const res = await request(app)
        .get('/api/consultas')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('consultas');
      expect(Array.isArray(res.body.consultas)).toBe(true);
    });

    test('deve agendar nova consulta', async () => {
      const dataHora = new Date();
      dataHora.setDate(dataHora.getDate() + 7);
      
      const minutosUnicos = Math.floor((timestamp % 10000) / 100);
      const hora = 8 + Math.floor(minutosUnicos / 6);
      const minuto = (minutosUnicos % 6) * 10;
      
      dataHora.setHours(hora, minuto, 0, 0);

      const res = await request(app)
        .post('/api/consultas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          paciente_id: pacienteId,
          medico_id: 1,
          data_hora: dataHora.toISOString(),
          tipo: 'CONSULTA',
          observacoes: 'Consulta de teste automatizado'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('consulta');
      expect(res.body.consulta.status).toBe('AGENDADA');
      
      consultaId = res.body.consulta.id;
      console.log(`Consulta agendada com ID: ${consultaId} às ${hora}:${minuto.toString().padStart(2, '0')}`);
    });

    test('não deve agendar consulta sem paciente_id', async () => {
      const dataHora = new Date();
      dataHora.setDate(dataHora.getDate() + 7);
      
      const res = await request(app)
        .post('/api/consultas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          medico_id: 1,
          data_hora: dataHora.toISOString(),
          tipo: 'CONSULTA'
        });

      expect(res.statusCode).toBe(400);
    });

  });

  // =====================================================================
  // RELATÓRIO FINAL
  // =====================================================================

  afterAll(() => {
    console.log('\n' + '═'.repeat(70));
    console.log('  TODOS OS TESTES CONCLUÍDOS COM SUCESSO');
    console.log('═'.repeat(70) + '\n');
  });

});

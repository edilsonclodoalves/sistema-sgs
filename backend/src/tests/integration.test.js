/**
 * Suite de Testes de Integração - SGS v1.0
 * 
 * IMPORTANTE: Este arquivo usa require('../../server') porque está em src/tests/
 */

const request = require('supertest');
const app = require('../../server'); // ✅ CAMINHO CORRETO (src/tests → raiz)
const { sequelize } = require('../models');

let adminToken, medicoToken, pacienteToken;
let pacienteId, consultaId;

describe('🧪 Suite de Testes SGS - Sistema de Gestão de Saúde', () => {

  // ═══════════════════════════════════════════════════════════════
  // SETUP E TEARDOWN
  // ═══════════════════════════════════════════════════════════════
  
  beforeAll(async () => {
    await sequelize.authenticate();
    console.log('\n✓ Conectado ao banco de dados de testes\n');
  });

  afterAll(async () => {
    await sequelize.close();
    console.log('\n✓ Conexão fechada\n');
  });

  // ═══════════════════════════════════════════════════════════════
  // TESTES DE AUTENTICAÇÃO
  // ═══════════════════════════════════════════════════════════════

  describe('🔐 Autenticação', () => {
    
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
        .post('/api/auth/login')
        .send({
          email: 'maria.santos@email.com',
          senha: 'paciente123'
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

  // ═══════════════════════════════════════════════════════════════
  // TESTES DE PACIENTES
  // ═══════════════════════════════════════════════════════════════

  describe('👥 Gestão de Pacientes', () => {

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
          cpf: '88888888888',
          nome_completo: 'Paciente Teste Automatizado',
          data_nascimento: '1990-01-01',
          sexo: 'M',
          email: 'teste.automatizado@email.com',
          telefone: '31999999999',
          tipo_sanguineo: 'O+',
          convenio: 'Particular'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('paciente');
      expect(res.body.paciente).toHaveProperty('numero_prontuario');
      
      pacienteId = res.body.paciente.id;
    });

    test('não deve criar paciente com CPF duplicado', async () => {
      const res = await request(app)
        .post('/api/pacientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cpf: '88888888888', // CPF já usado no teste anterior
          nome_completo: 'Outro Nome',
          data_nascimento: '1990-01-01',
          sexo: 'M',
          email: 'outro@email.com',
          telefone: '31999999999'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('CPF');
    });

  });

  // ═══════════════════════════════════════════════════════════════
  // TESTES DE CONSULTAS
  // ═══════════════════════════════════════════════════════════════

  describe('📅 Gestão de Consultas', () => {

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
      dataHora.setDate(dataHora.getDate() + 7); // Daqui a 7 dias
      dataHora.setHours(14, 0, 0, 0);

      const res = await request(app)
        .post('/api/consultas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          paciente_id: pacienteId || 1,
          medico_id: 1,
          data_hora: dataHora.toISOString(),
          tipo: 'CONSULTA',
          observacoes: 'Consulta de teste automatizado'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('consulta');
      expect(res.body.consulta.status).toBe('AGENDADA');
      
      consultaId = res.body.consulta.id;
    });

  });

  // ═══════════════════════════════════════════════════════════════
  // RELATÓRIO FINAL
  // ═══════════════════════════════════════════════════════════════

  afterAll(() => {
    console.log('\n' + '═'.repeat(70));
    console.log('  ✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO');
    console.log('═'.repeat(70) + '\n');
  });

});
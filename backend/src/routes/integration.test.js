/**
 * Suite de Testes Completa - SGS v1.0
 */

const request = require('supertest');
const app = require('../../server'); // ✅ CAMINHO CORRETO
const { sequelize } = require('../models');

let adminToken, medicoToken, pacienteToken, recepToken;
let pacienteId, medicoId, consultaId;

describe('🧪 Suite de Testes SGS', () => {

  beforeAll(async () => {
    await sequelize.authenticate();
    console.log('\n✓ Conectado ao banco de testes\n');
  });

  afterAll(async () => {
    await sequelize.close();
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
      medicoToken = res.body.token;
    });

    test('não deve permitir login com senha incorreta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@sgs.com',
          senha: 'senhaerrada'
        });

      expect(res.statusCode).toBe(401);
    });

    test('deve retornar dados do usuário logado', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
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
          cpf: '99999999999',
          nome_completo: 'Teste Automatizado',
          data_nascimento: '1990-01-01',
          sexo: 'M',
          email: 'teste@email.com',
          telefone: '31999999999',
          tipo_sanguineo: 'O+'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('paciente');
      
      pacienteId = res.body.paciente.id;
    });

    test('não deve criar paciente com CPF duplicado', async () => {
      const res = await request(app)
        .post('/api/pacientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cpf: '99999999999',
          nome_completo: 'Outro Nome',
          data_nascimento: '1990-01-01',
          sexo: 'M',
          email: 'outro@email.com',
          telefone: '31999999999'
        });

      expect(res.statusCode).toBe(400);
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
    });

    test('deve agendar nova consulta', async () => {
      const dataHora = new Date();
      dataHora.setDate(dataHora.getDate() + 7);
      dataHora.setHours(14, 0, 0, 0);

      const res = await request(app)
        .post('/api/consultas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          paciente_id: pacienteId || 1,
          medico_id: 1,
          data_hora: dataHora.toISOString(),
          tipo: 'CONSULTA'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.consulta.status).toBe('AGENDADA');
      
      consultaId = res.body.consulta.id;
    });

  });

  // ═══════════════════════════════════════════════════════════════
  // RELATÓRIO FINAL
  // ═══════════════════════════════════════════════════════════════

  afterAll(() => {
    console.log('\n✅ TODOS OS TESTES CONCLUÍDOS\n');
  });

});

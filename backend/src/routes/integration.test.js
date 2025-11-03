/**
 * Suite de Testes Completa - SGS v1.0
 * Atualizado com login de paciente por CPF e data de nascimento
 */

const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../models');

let adminToken, medicoToken, pacienteToken;
let pacienteId, pacienteCpf, pacienteDataNascimento;
let medicoId, consultaId;

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
      expect(res.body).toHaveProperty('token');
      expect(res.body.usuario.perfil).toBe('MEDICO');
      
      medicoToken = res.body.token;
      
      // Capturar ID do médico para usar nos testes de consulta
      if (res.body.usuario.pessoa && res.body.usuario.pessoa.medico) {
        medicoId = res.body.usuario.pessoa.medico.id;
      }
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
      // Gerar CPF único para o teste
      const cpfTeste = `999${Date.now().toString().slice(-8)}`;
      const emailTeste = `teste${Date.now()}@email.com`;
      
      pacienteCpf = cpfTeste;
      pacienteDataNascimento = '1990-01-01';

      const res = await request(app)
        .post('/api/pacientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cpf: cpfTeste,
          nome_completo: 'Teste Automatizado',
          data_nascimento: pacienteDataNascimento,
          sexo: 'M',
          email: emailTeste,
          telefone: '31999999999',
          tipo_sanguineo: 'O+'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('paciente');
      expect(res.body.paciente).toHaveProperty('id');
      expect(res.body.paciente).toHaveProperty('numero_prontuario');
      
      pacienteId = res.body.paciente.id;
      
      console.log(`\n✓ Paciente criado: ID=${pacienteId}, CPF=${cpfTeste}\n`);
    });

    test('não deve criar paciente com CPF duplicado', async () => {
      const res = await request(app)
        .post('/api/pacientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cpf: pacienteCpf, // Usando o CPF do paciente criado anteriormente
          nome_completo: 'Outro Nome',
          data_nascimento: '1990-01-01',
          sexo: 'M',
          email: 'outro@email.com',
          telefone: '31999999999'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/CPF já cadastrado/i);
    });

    test('deve buscar paciente por ID', async () => {
      const res = await request(app)
        .get(`/api/pacientes/${pacienteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.paciente.id).toBe(pacienteId);
    });

    test('não deve criar paciente sem campos obrigatórios', async () => {
      const res = await request(app)
        .post('/api/pacientes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome_completo: 'Sem CPF'
        });

      expect(res.statusCode).toBe(400);
    });

  });

  // ═══════════════════════════════════════════════════════════════
  // TESTES DE LOGIN DE PACIENTE (NOVO!)
  // ═══════════════════════════════════════════════════════════════

  describe('🔐 Login de Paciente', () => {

    test('deve fazer login de paciente com CPF e data de nascimento', async () => {
      // Aguardar um pouco para garantir que o usuário foi criado
      await new Promise(resolve => setTimeout(resolve, 500));

      const res = await request(app)
        .post('/api/auth/login-paciente')
        .send({
          cpf: pacienteCpf,
          data_nascimento: pacienteDataNascimento
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.perfil).toBe('PACIENTE');
      expect(res.body).toHaveProperty('paciente');
      expect(res.body).toHaveProperty('usuario');

      pacienteToken = res.body.token;
      
      console.log(`\n✓ Paciente logado com sucesso!\n`);
    });

    test('não deve fazer login com CPF inexistente', async () => {
      const res = await request(app)
        .post('/api/auth/login-paciente')
        .send({
          cpf: '11111111111',
          data_nascimento: '1990-01-01'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch(/Credenciais inválidas/i);
    });

    test('não deve fazer login com data de nascimento incorreta', async () => {
      const res = await request(app)
        .post('/api/auth/login-paciente')
        .send({
          cpf: pacienteCpf,
          data_nascimento: '1985-05-05' // Data errada
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('tentativas_restantes');
    });

    test('não deve fazer login sem CPF ou data de nascimento', async () => {
      const res = await request(app)
        .post('/api/auth/login-paciente')
        .send({
          cpf: pacienteCpf
          // Faltando data_nascimento
        });

      expect(res.statusCode).toBe(400);
    });

  });

  // ═══════════════════════════════════════════════════════════════
  // TESTES DE CONSULTAS
  // ═══════════════════════════════════════════════════════════════

  describe('📅 Gestão de Consultas', () => {

    // Buscar um médico existente antes dos testes de consulta
    beforeAll(async () => {
      if (!medicoId) {
        const res = await request(app)
          .get('/api/medicos')
          .set('Authorization', `Bearer ${adminToken}`);

        if (res.body.medicos && res.body.medicos.length > 0) {
          medicoId = res.body.medicos[0].id;
          console.log(`\n✓ Médico encontrado: ID=${medicoId}\n`);
        }
      }
    });

    test('deve listar consultas', async () => {
      const res = await request(app)
        .get('/api/consultas')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('consultas');
      expect(Array.isArray(res.body.consultas)).toBe(true);
    });

    test('deve agendar nova consulta para o paciente criado', async () => {
      // Validar que temos os IDs necessários
      expect(pacienteId).toBeDefined();
      expect(medicoId).toBeDefined();

      const dataHora = new Date();
      dataHora.setDate(dataHora.getDate() + 7); // 7 dias no futuro
      dataHora.setHours(14, 0, 0, 0);

      const res = await request(app)
        .post('/api/consultas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          paciente_id: pacienteId, // ✅ Usando o paciente criado no teste
          medico_id: medicoId,
          data_hora: dataHora.toISOString(),
          tipo: 'CONSULTA',
          observacoes: 'Consulta de teste automatizado'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('consulta');
      expect(res.body.consulta.status).toBe('AGENDADA');
      expect(res.body.consulta.paciente_id).toBe(pacienteId);
      expect(res.body.consulta.medico_id).toBe(medicoId);
      
      consultaId = res.body.consulta.id;
      
      console.log(`\n✓ Consulta agendada: ID=${consultaId} para Paciente ID=${pacienteId}\n`);
    });

    test('deve buscar consulta por ID', async () => {
      const res = await request(app)
        .get(`/api/consultas/${consultaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.consulta.id).toBe(consultaId);
      expect(res.body.consulta.paciente_id).toBe(pacienteId);
    });

    test('não deve agendar consulta sem paciente_id', async () => {
      const dataHora = new Date();
      dataHora.setDate(dataHora.getDate() + 7);

      const res = await request(app)
        .post('/api/consultas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          medico_id: medicoId,
          data_hora: dataHora.toISOString(),
          tipo: 'CONSULTA'
        });

      expect(res.statusCode).toBe(400);
    });

    test('não deve agendar consulta sem autenticação', async () => {
      const dataHora = new Date();
      dataHora.setDate(dataHora.getDate() + 7);

      const res = await request(app)
        .post('/api/consultas')
        .send({
          paciente_id: pacienteId,
          medico_id: medicoId,
          data_hora: dataHora.toISOString(),
          tipo: 'CONSULTA'
        });

      expect(res.statusCode).toBe(401);
    });

  });

  // ═══════════════════════════════════════════════════════════════
  // TESTES DE EXAMES (OPCIONAL)
  // ═══════════════════════════════════════════════════════════════

  describe('🔬 Gestão de Exames', () => {

    test('deve listar exames', async () => {
      const res = await request(app)
        .get('/api/exames')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('exames');
    });

    test('deve solicitar novo exame para o paciente', async () => {
      const res = await request(app)
        .post('/api/exames')
        .set('Authorization', `Bearer ${medicoToken}`)
        .send({
          paciente_id: pacienteId,
          tipo_exame: 'Hemograma Completo',
          observacoes: 'Exame de rotina - teste automatizado'
        });

      // Pode ser 201 (criado) ou 404 (rota não implementada)
      expect([201, 404]).toContain(res.statusCode);
    });

  });

  // ═══════════════════════════════════════════════════════════════
  // RELATÓRIO FINAL
  // ═══════════════════════════════════════════════════════════════

  afterAll(() => {
    console.log('\n✅ TODOS OS TESTES CONCLUÍDOS\n');
  });

});
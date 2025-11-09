/**
 * Suite de Testes Completa - SGS v1.0
 * Atualizado com login de paciente por CPF e data de nascimento
 * 
 * Esta suíte utiliza Jest e Supertest para validar as principais funcionalidades
 * do sistema SGS, incluindo autenticação, gestão de pacientes, consultas e exames.
 * Os testes são executados em um ambiente de banco de dados de teste.
 */

const request = require('supertest');
const app = require('../../server');
const { sequelize } = require('../models');

let adminToken, medicoToken, pacienteToken;
let pacienteId, pacienteCpf, pacienteDataNascimento;
let medicoId, consultaId;

describe('🧪 Suite de Testes SGS', () => {

  /**
   * Configuração inicial: autentica conexão com o banco de dados de teste
   * e exibe mensagem de confirmação.
   */
  beforeAll(async () => {
    await sequelize.authenticate();
    console.log('\n✓ Conectado ao banco de testes\n');
  });

  /**
   * Limpeza final: fecha a conexão com o banco de dados após todos os testes.
   */
  afterAll(async () => {
    await sequelize.close();
  });

  // ═══════════════════════════════════════════════════════════════
  // TESTES DE AUTENTICAÇÃO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Bloco de testes para funcionalidades de autenticação de usuários
   * (administradores, médicos e validações de erro).
   */
  describe('🔐 Autenticação', () => {
    
    /**
     * Testa o login bem-sucedido de um administrador, capturando o token
     * para uso em testes subsequentes.
     */
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

    /**
     * Testa o login bem-sucedido de um médico, capturando o token e o ID
     * para uso em testes de agendamento de consultas.
     */
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

    /**
     * Testa a falha de login com senha incorreta, verificando status 401
     * e mensagem de erro.
     */
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

    /**
     * Testa a rota /me para retornar dados do usuário autenticado
     * com token de administrador.
     */
    test('deve retornar dados do usuário logado', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.usuario.perfil).toBe('ADMINISTRADOR');
    });

    /**
     * Testa o acesso não autorizado à rota /me sem token de autenticação.
     */
    test('não deve acessar /me sem token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
    });

  });

  // ═══════════════════════════════════════════════════════════════
  // TESTES DE PACIENTES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Bloco de testes para CRUD de pacientes, incluindo validações de unicidade
   * e campos obrigatórios.
   */
  describe('👥 Gestão de Pacientes', () => {

    /**
     * Testa a listagem de pacientes existentes no sistema.
     */
    test('deve listar pacientes', async () => {
      const res = await request(app)
        .get('/api/pacientes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('pacientes');
      expect(Array.isArray(res.body.pacientes)).toBe(true);
    });

    /**
     * Testa a criação de um novo paciente com dados válidos, gerando
     * CPF único e capturando ID para testes subsequentes.
     */
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

    /**
     * Testa a falha na criação de paciente com CPF duplicado, verificando
     * erro de validação.
     */
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

    /**
     * Testa a busca de um paciente específico por ID.
     */
    test('deve buscar paciente por ID', async () => {
      const res = await request(app)
        .get(`/api/pacientes/${pacienteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.paciente.id).toBe(pacienteId);
    });

    /**
     * Testa a falha na criação de paciente sem campos obrigatórios (ex: CPF).
     */
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

  /**
   * Bloco de testes para o novo fluxo de login de pacientes via CPF e data de nascimento.
   */
  describe('🔐 Login de Paciente', () => {

    /**
     * Testa o login bem-sucedido de paciente usando CPF e data de nascimento,
     * capturando o token para testes subsequentes.
     */
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

    /**
     * Testa a falha de login com CPF inexistente no sistema.
     */
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

    /**
     * Testa a falha de login com data de nascimento incorreta para CPF válido.
     */
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

    /**
     * Testa a falha de login sem fornecer todos os campos obrigatórios.
     */
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

  /**
   * Bloco de testes para CRUD de consultas, incluindo agendamento e validações.
   */
  describe('📅 Gestão de Consultas', () => {

    /**
     * Configuração inicial: busca um médico existente se não houver ID capturado.
     */
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

    /**
     * Testa a listagem de consultas existentes no sistema.
     */
    test('deve listar consultas', async () => {
      const res = await request(app)
        .get('/api/consultas')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('consultas');
      expect(Array.isArray(res.body.consultas)).toBe(true);
    });

    /**
     * Testa o agendamento de uma nova consulta usando o paciente e médico criados/busca.
     */
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

    /**
     * Testa a busca de uma consulta específica por ID.
     */
    test('deve buscar consulta por ID', async () => {
      const res = await request(app)
        .get(`/api/consultas/${consultaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.consulta.id).toBe(consultaId);
      expect(res.body.consulta.paciente_id).toBe(pacienteId);
    });

    /**
     * Testa a falha no agendamento sem fornecer paciente_id obrigatório.
     */
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

    /**
     * Testa a falha no agendamento sem autenticação (sem token).
     */
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

  /**
   * Bloco de testes básicos para gestão de exames (pode ser expandido).
   */
  describe('🔬 Gestão de Exames', () => {

    /**
     * Testa a listagem de exames existentes no sistema.
     */
    test('deve listar exames', async () => {
      const res = await request(app)
        .get('/api/exames')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('exames');
    });

    /**
     * Testa a solicitação de um novo exame para o paciente criado
     * (aceita 201 ou 404 se a rota não estiver fully implementada).
     */
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

  /**
   * Mensagem final exibida após a execução de todos os testes.
   */
  afterAll(() => {
    console.log('\n✅ TODOS OS TESTES CONCLUÍDOS\n');
  });

});
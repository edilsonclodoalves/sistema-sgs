const { 
  sequelize, 
  Usuario, 
  Paciente, 
  Medico, 
  Consulta, 
  Prontuario, 
  Exame, 
  Prescricao 
} = require('../models');

const bcrypt = require('bcrypt');

async function seedDatabase() {
  try {
    // Sincronizar modelos com o banco de dados (force: true para recriar as tabelas)
    await sequelize.sync({ force: true });
    console.log('Banco de dados sincronizado.');

    // Criar usuários
    const adminSenha = await bcrypt.hash('admin123', 10);
    const medicoSenha = await bcrypt.hash('medico123', 10);
    const recepSenha = await bcrypt.hash('recep123', 10);

    const usuarios = await Usuario.bulkCreate([
      {
        nome: 'Administrador',
        email: 'admin@clinica.com',
        senha: adminSenha,
        role: 'admin'
      },
      {
        nome: 'Dr. Carlos Silva',
        email: 'carlos@clinica.com',
        senha: medicoSenha,
        role: 'medico',
        id_referencia: 1 // Será o ID do médico
      },
      {
        nome: 'Maria Recepcionista',
        email: 'maria@clinica.com',
        senha: recepSenha,
        role: 'recepcionista'
      }
    ]);
    console.log('Usuários criados:', usuarios.length);

    // Criar médicos
    const medicos = await Medico.bulkCreate([
      {
        nome: 'Dr. Carlos Silva',
        crm: '12345-SP',
        especialidade: 'Clínico Geral',
        telefone: '(11) 98765-4321',
        email: 'carlos@clinica.com'
      },
      {
        nome: 'Dra. Ana Oliveira',
        crm: '54321-SP',
        especialidade: 'Cardiologia',
        telefone: '(11) 91234-5678',
        email: 'ana@clinica.com'
      },
      {
        nome: 'Dr. Pedro Costa',
        crm: '11111-SP',
        especialidade: 'Pediatria',
        telefone: '(11) 92345-6789',
        email: 'pedro.costa@clinica.com'
      },
      {
        nome: 'Dra. Julia Mendes',
        crm: '22222-SP',
        especialidade: 'Ginecologia',
        telefone: '(11) 93456-7890',
        email: 'julia@clinica.com'
      },
      {
        nome: 'Dr. Roberto Santos',
        crm: '33333-SP',
        especialidade: 'Ortopedia',
        telefone: '(11) 94567-8901',
        email: 'roberto@clinica.com'
      }
    ]);
    console.log('Médicos criados:', medicos.length);

    // Criar pacientes com senhas
    const pacienteSenha = await bcrypt.hash('paciente123', 10);
    
    const pacientes = await Paciente.bulkCreate([
      {
        nome: 'João Pereira',
        cpf: '12345678900',
        data_nascimento: '1980-05-15',
        telefone: '11998765432',
        email: 'joao@email.com',
        endereco: 'Rua A, 123 - São Paulo/SP',
        cep: '01234567',
        senha: pacienteSenha,
        ativo: true
      },
      {
        nome: 'Maria Santos',
        cpf: '98765432100',
        data_nascimento: '1990-10-20',
        telefone: '11987654321',
        email: 'maria@email.com',
        endereco: 'Av. B, 456 - São Paulo/SP',
        cep: '02345678',
        senha: pacienteSenha,
        ativo: true
      },
      {
        nome: 'Pedro Alves',
        cpf: '45678912300',
        data_nascimento: '1975-03-25',
        telefone: '11976543210',
        email: 'pedro@email.com',
        endereco: 'Rua C, 789 - São Paulo/SP',
        cep: '03456789',
        senha: pacienteSenha,
        ativo: true
      }
    ]);
    console.log('Pacientes criados:', pacientes.length);

    // Criar consultas
    const consultas = await Consulta.bulkCreate([
      {
        id_paciente: 1,
        id_medico: 1,
        data_consulta: '2025-11-15',
        horario: '09:00',
        tipo: 'primeira_consulta',
        especialidade: 'Clínico Geral',
        unidade: 'UBS Centro',
        status: 'agendada',
        motivo: 'Consulta de rotina',
        observacoes: 'Paciente solicita check-up',
        protocolo: 'CONS-2025111509-001'
      },
      {
        id_paciente: 2,
        id_medico: 2,
        data_consulta: '2025-11-16',
        horario: '10:00',
        tipo: 'primeira_consulta',
        especialidade: 'Cardiologia',
        unidade: 'UBS Centro',
        status: 'agendada',
        motivo: 'Dor no peito',
        observacoes: 'Paciente com histórico familiar de problemas cardíacos',
        protocolo: 'CONS-2025111610-002'
      },
      {
        id_paciente: 3,
        id_medico: 1,
        data_consulta: '2025-11-05',
        horario: '14:00',
        tipo: 'retorno',
        especialidade: 'Clínico Geral',
        unidade: 'UBS Vila Nova',
        status: 'realizada',
        motivo: 'Gripe',
        observacoes: 'Retorno após tratamento',
        diagnostico: 'Gripe comum - Paciente recuperado',
        protocolo: 'CONS-2025110514-003'
      }
    ]);
    console.log('Consultas criadas:', consultas.length);

    // Criar prontuários
    const prontuarios = await Prontuario.bulkCreate([
      {
        id_paciente: 3,
        data_registro: '2025-11-05 14:30:00',
        diagnostico: 'Gripe comum - Paciente apresentou sintomas típicos de gripe viral',
        observacoes: 'Paciente apresentou sintomas de gripe. Recomendado repouso, hidratação e antitérmicos. Retorno em caso de piora dos sintomas.'
      }
    ]);
    console.log('Prontuários criados:', prontuarios.length);

    // Criar exames
    const exames = await Exame.bulkCreate([
      {
        id_consulta: 3,
        id_paciente: 3,
        tipo_exame: 'Hemograma Completo',
        data_solicitacao: '2025-11-05 14:30:00',
        status: 'Concluído',
        resultado: 'Resultados normais, sem alterações significativas. Contagem de leucócitos dentro dos valores de referência.'
      }
    ]);
    console.log('Exames criados:', exames.length);

    // Criar prescrições
    const prescricoes = await Prescricao.bulkCreate([
      {
        id_consulta: 3,
        id_paciente: 3,
        medicamento: 'Paracetamol',
        dosagem: '500mg',
        instrucoes: 'Tomar 1 comprimido a cada 6 horas em caso de febre ou dor.',
        data_prescricao: '2025-06-05 14:30:00'
      }
    ]);
    console.log('Prescrições criadas:', prescricoes.length);

    console.log('Banco de dados populado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
    process.exit(1);
  }
}

// Executar a função
seedDatabase();
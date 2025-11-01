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
      }
    ]);
    console.log('Médicos criados:', medicos.length);

    // Criar pacientes
    const pacientes = await Paciente.bulkCreate([
      {
        nome: 'João Pereira',
        cpf: '123.456.789-00',
        data_nascimento: '1980-05-15',
        telefone: '(11) 99876-5432',
        email: 'joao@email.com',
        endereco: 'Rua A, 123 - São Paulo/SP'
      },
      {
        nome: 'Maria Santos',
        cpf: '987.654.321-00',
        data_nascimento: '1990-10-20',
        telefone: '(11) 98765-4321',
        email: 'maria@email.com',
        endereco: 'Av. B, 456 - São Paulo/SP'
      },
      {
        nome: 'Pedro Alves',
        cpf: '456.789.123-00',
        data_nascimento: '1975-03-25',
        telefone: '(11) 97654-3210',
        email: 'pedro@email.com',
        endereco: 'Rua C, 789 - São Paulo/SP'
      }
    ]);
    console.log('Pacientes criados:', pacientes.length);

    // Criar consultas
    const consultas = await Consulta.bulkCreate([
      {
        id_paciente: 1,
        id_medico: 1,
        data_consulta: '2025-06-10 09:00:00',
        status: 'Agendada',
        motivo: 'Consulta de rotina'
      },
      {
        id_paciente: 2,
        id_medico: 2,
        data_consulta: '2025-06-10 10:00:00',
        status: 'Agendada',
        motivo: 'Dor no peito'
      },
      {
        id_paciente: 3,
        id_medico: 1,
        data_consulta: '2025-06-05 14:00:00',
        status: 'Realizada',
        motivo: 'Gripe'
      }
    ]);
    console.log('Consultas criadas:', consultas.length);

    // Criar prontuários
    const prontuarios = await Prontuario.bulkCreate([
      {
        id_paciente: 3,
        data_registro: '2025-06-05 14:30:00',
        diagnostico: 'Gripe comum',
        observacoes: 'Paciente apresentou sintomas de gripe. Recomendado repouso e hidratação.'
      }
    ]);
    console.log('Prontuários criados:', prontuarios.length);

    // Criar exames
    const exames = await Exame.bulkCreate([
      {
        id_consulta: 3,
        id_paciente: 3,
        tipo_exame: 'Hemograma',
        data_solicitacao: '2025-06-05 14:30:00',
        status: 'Concluído',
        resultado: 'Resultados normais, sem alterações significativas.'
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


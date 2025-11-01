const { Consulta, Paciente, Medico } = require('../models');
const { Op } = require('sequelize');

// Função para gerar protocolo único
const gerarProtocolo = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `CONS-${timestamp}-${random}`;
};

// Função para gerar horários disponíveis
const gerarHorariosDisponiveis = () => {
  const horarios = [];
  for (let hora = 8; hora <= 17; hora++) {
    horarios.push(`${hora.toString().padStart(2, '0')}:00`);
    if (hora < 17) {
      horarios.push(`${hora.toString().padStart(2, '0')}:30`);
    }
  }
  return horarios;
};

const consultaController = {
  // Listar consultas do paciente autenticado
  listarConsultas: async (req, res) => {
    try {
      const pacienteId = req.user.id;
      
      const consultas = await Consulta.findAll({
        where: { id_paciente: pacienteId },
        order: [['data_consulta', 'DESC']],
        include: [
          { 
            model: Medico, 
            attributes: ['id_medico', 'nome', 'crm', 'especialidade'] 
          }
        ]
      });

      return res.status(200).json(consultas);
    } catch (error) {
      console.error('Erro ao listar consultas:', error);
      return res.status(500).json({
        error: 'Erro ao listar consultas',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Buscar consulta por ID
  buscarConsulta: async (req, res) => {
    try {
      const { id } = req.params;
      const pacienteId = req.user.id;
      
      const consulta = await Consulta.findOne({
        where: { 
          id_consulta: id,
          id_paciente: pacienteId 
        },
        include: [
          { model: Paciente, attributes: ['id_paciente', 'nome', 'cpf'] },
          { model: Medico, attributes: ['id_medico', 'nome', 'crm', 'especialidade'] }
        ]
      });

      if (!consulta) {
        return res.status(404).json({
          error: 'Consulta não encontrada'
        });
      }

      return res.status(200).json(consulta);
    } catch (error) {
      console.error('Erro ao buscar consulta:', error);
      return res.status(500).json({
        error: 'Erro ao buscar consulta',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Agendar nova consulta (UC01)
  agendarConsulta: async (req, res) => {
    try {
      const pacienteId = req.user.id;
      const { 
        medico_id, 
        data, 
        horario, 
        tipo, 
        especialidade, 
        unidade, 
        observacoes 
      } = req.body;

      // Validar campos obrigatórios
      if (!medico_id || !data || !horario || !tipo || !especialidade || !unidade) {
        return res.status(400).json({
          error: 'Todos os campos obrigatórios devem ser preenchidos'
        });
      }

      // Verificar se o médico existe
      const medico = await Medico.findByPk(medico_id);
      if (!medico) {
        return res.status(404).json({
          error: 'Médico não encontrado'
        });
      }

      // Verificar se já existe consulta para o mesmo médico, data e horário
      const consultaExistente = await Consulta.findOne({
        where: {
          id_medico: medico_id,
          data_consulta: data,
          horario: horario,
          status: {
            [Op.in]: ['agendada', 'confirmada']
          }
        }
      });

      if (consultaExistente) {
        return res.status(409).json({
          error: 'Este horário já está ocupado. Por favor, escolha outro horário.'
        });
      }

      // Gerar protocolo único
      const protocolo = gerarProtocolo();

      // Criar nova consulta
      const novaConsulta = await Consulta.create({
        id_paciente: pacienteId,
        id_medico: medico_id,
        data_consulta: data,
        horario,
        tipo,
        especialidade,
        unidade,
        observacoes,
        status: 'agendada',
        protocolo
      });

      // Buscar consulta criada com relacionamentos
      const consultaCriada = await Consulta.findByPk(novaConsulta.id_consulta, {
        include: [
          { model: Medico, attributes: ['id_medico', 'nome', 'especialidade'] }
        ]
      });

      return res.status(201).json({
        message: 'Consulta agendada com sucesso!',
        consulta: consultaCriada
      });
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
      return res.status(500).json({
        error: 'Erro ao agendar consulta',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Atualizar consulta
  atualizarConsulta: async (req, res) => {
    try {
      const { id } = req.params;
      const pacienteId = req.user.id;
      const dados = req.body;

      const consulta = await Consulta.findOne({
        where: { 
          id_consulta: id,
          id_paciente: pacienteId 
        }
      });

      if (!consulta) {
        return res.status(404).json({
          error: 'Consulta não encontrada'
        });
      }

      // Não permitir atualização de consultas já realizadas ou canceladas
      if (consulta.status === 'realizada' || consulta.status === 'cancelada') {
        return res.status(400).json({
          error: 'Não é possível atualizar consultas realizadas ou canceladas'
        });
      }

      await consulta.update(dados);

      const consultaAtualizada = await Consulta.findByPk(id, {
        include: [
          { model: Medico, attributes: ['id_medico', 'nome', 'especialidade'] }
        ]
      });

      return res.status(200).json({
        message: 'Consulta atualizada com sucesso',
        consulta: consultaAtualizada
      });
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar consulta',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Cancelar consulta
  cancelarConsulta: async (req, res) => {
    try {
      const { id } = req.params;
      const pacienteId = req.user.id;

      const consulta = await Consulta.findOne({
        where: { 
          id_consulta: id,
          id_paciente: pacienteId 
        }
      });

      if (!consulta) {
        return res.status(404).json({
          error: 'Consulta não encontrada'
        });
      }

      // Verificar se a consulta pode ser cancelada
      if (consulta.status === 'realizada') {
        return res.status(400).json({
          error: 'Não é possível cancelar uma consulta já realizada'
        });
      }

      if (consulta.status === 'cancelada') {
        return res.status(400).json({
          error: 'Esta consulta já está cancelada'
        });
      }

      // Verificar se a consulta é hoje ou no passado
      const dataConsulta = new Date(consulta.data_consulta);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (dataConsulta < hoje) {
        return res.status(400).json({
          error: 'Não é possível cancelar consultas passadas'
        });
      }

      await consulta.update({ status: 'cancelada' });

      return res.status(200).json({
        message: 'Consulta cancelada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error);
      return res.status(500).json({
        error: 'Erro ao cancelar consulta',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Listar consultas por status
  listarPorStatus: async (req, res) => {
    try {
      const { status } = req.params;
      const pacienteId = req.user.id;

      const consultas = await Consulta.findAll({
        where: { 
          id_paciente: pacienteId,
          status: status
        },
        order: [['data_consulta', 'DESC']],
        include: [
          { model: Medico, attributes: ['id_medico', 'nome', 'especialidade'] }
        ]
      });

      return res.status(200).json(consultas);
    } catch (error) {
      console.error('Erro ao listar consultas por status:', error);
      return res.status(500).json({
        error: 'Erro ao listar consultas',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Listar horários disponíveis para um médico em uma data
  listarHorariosDisponiveis: async (req, res) => {
    try {
      const { medicoId, data } = req.query;

      if (!medicoId || !data) {
        return res.status(400).json({
          error: 'Médico e data são obrigatórios'
        });
      }

      // Buscar consultas agendadas para o médico nesta data
      const consultasAgendadas = await Consulta.findAll({
        where: {
          id_medico: medicoId,
          data_consulta: data,
          status: {
            [Op.in]: ['agendada', 'confirmada']
          }
        },
        attributes: ['horario']
      });

      // Obter horários já ocupados
      const horariosOcupados = consultasAgendadas.map(c => c.horario);

      // Gerar todos os horários possíveis
      const todosHorarios = gerarHorariosDisponiveis();

      // Filtrar horários disponíveis
      const horariosDisponiveis = todosHorarios.filter(
        horario => !horariosOcupados.includes(horario)
      );

      return res.status(200).json(horariosDisponiveis);
    } catch (error) {
      console.error('Erro ao listar horários disponíveis:', error);
      return res.status(500).json({
        error: 'Erro ao listar horários disponíveis',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = consultaController;

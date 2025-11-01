import api from './api';

export const consultaService = {
  // Listar todas as consultas do paciente
  listarConsultas: async () => {
    const response = await api.get('/consultas');
    return response.data;
  },

  // Buscar consulta por ID
  buscarConsulta: async (id) => {
    const response = await api.get(`/consultas/${id}`);
    return response.data;
  },

  // Agendar nova consulta
  agendarConsulta: async (dados) => {
    const response = await api.post('/consultas', dados);
    return response.data;
  },

  // Atualizar consulta
  atualizarConsulta: async (id, dados) => {
    const response = await api.put(`/consultas/${id}`, dados);
    return response.data;
  },

  // Cancelar consulta
  cancelarConsulta: async (id) => {
    const response = await api.delete(`/consultas/${id}`);
    return response.data;
  },

  // Listar consultas por status
  listarPorStatus: async (status) => {
    const response = await api.get(`/consultas/status/${status}`);
    return response.data;
  },

  // Listar médicos disponíveis
  listarMedicos: async () => {
    const response = await api.get('/medicos');
    return response.data;
  },

  // Listar horários disponíveis
  listarHorariosDisponiveis: async (medicoId, data) => {
    const response = await api.get(`/consultas/horarios-disponiveis`, {
      params: { medicoId, data }
    });
    return response.data;
  }
};

export default consultaService;

import api from './api';

export const prontuarioService = {
  // Buscar histórico médico completo do paciente
  buscarHistorico: async (pacienteId) => {
    const response = await api.get(`/prontuarios/paciente/${pacienteId}`);
    return response.data;
  },

  // Buscar prontuário específico
  buscarProntuario: async (id) => {
    const response = await api.get(`/prontuarios/${id}`);
    return response.data;
  },

  // Listar exames do paciente
  listarExames: async (pacienteId) => {
    const response = await api.get(`/exames/paciente/${pacienteId}`);
    return response.data;
  },

  // Listar prescrições do paciente
  listarPrescricoes: async (pacienteId) => {
    const response = await api.get(`/prescricoes/paciente/${pacienteId}`);
    return response.data;
  },

  // Baixar relatório em PDF
  baixarRelatorio: async (pacienteId) => {
    const response = await api.get(`/prontuarios/paciente/${pacienteId}/relatorio`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default prontuarioService;

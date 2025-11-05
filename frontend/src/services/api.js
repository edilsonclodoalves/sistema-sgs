import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@SaudeSistema:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expirado ou inválido
    if (error.response?.status === 401) {
      localStorage.removeItem('@SaudeSistema:token');
      localStorage.removeItem('@SaudeSistema:user');
      
      // Redireciona para login apenas se não estiver já em uma página de login
      if (!window.location.pathname.includes('login') && !window.location.pathname.includes('admin')) {
        window.location.href = '/login-paciente';
      }
    }
    
    // Acesso negado (403)
    if (error.response?.status === 403) {
      console.error('Acesso negado:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;

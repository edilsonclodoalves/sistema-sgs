import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('@SaudeSistema:user');
    const token = localStorage.getItem('@SaudeSistema:token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  const login = async (cpf, senha) => {
    try {
      const response = await api.post('/auth/login', { cpf, senha });
      const { token, usuario } = response.data;

      localStorage.setItem('@SaudeSistema:token', token);
      localStorage.setItem('@SaudeSistema:user', JSON.stringify(usuario));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(usuario);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Erro ao fazer login'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Erro ao fazer cadastro'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('@SaudeSistema:token');
    localStorage.removeItem('@SaudeSistema:user');
    api.defaults.headers.common['Authorization'] = '';
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

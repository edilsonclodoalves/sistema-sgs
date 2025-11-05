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
      const userData = JSON.parse(storedUser);
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  // Login de paciente (CPF + data de nascimento)
  const loginPaciente = async (cpf, dataNascimento) => {
    try {
      const response = await api.post('/auth/login-paciente', {
        cpf: cpf.replace(/\D/g, ''), // Remove formatação
        data_nascimento: dataNascimento
      });

      const { token, usuario, perfil } = response.data;

      localStorage.setItem('@SaudeSistema:token', token);
      localStorage.setItem('@SaudeSistema:user', JSON.stringify({ ...usuario, perfil }));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ ...usuario, perfil });

      return { success: true, perfil };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login'
      };
    }
  };

  // Login de usuário do sistema (email + senha)
  const loginUsuario = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        senha
      });

      const { token, usuario, perfil } = response.data;

      localStorage.setItem('@SaudeSistema:token', token);
      localStorage.setItem('@SaudeSistema:user', JSON.stringify({ ...usuario, perfil }));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ ...usuario, perfil });

      return { success: true, perfil };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('@SaudeSistema:token');
    localStorage.removeItem('@SaudeSistema:user');
    api.defaults.headers.common['Authorization'] = '';
    setUser(null);
  };

  // Verifica se o usuário tem um perfil específico
  const hasRole = (perfil) => {
    if (!user) return false;
    if (Array.isArray(perfil)) {
      return perfil.includes(user.perfil);
    }
    return user.perfil === perfil;
  };

  // Verifica se é administrador
  const isAdmin = () => hasRole('ADMINISTRADOR');

  // Verifica se é paciente
  const isPaciente = () => hasRole('PACIENTE');

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginPaciente,
      loginUsuario,
      logout,
      hasRole,
      isAdmin,
      isPaciente
    }}>
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
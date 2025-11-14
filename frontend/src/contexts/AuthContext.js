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

      const { token, usuario, paciente, perfil } = response.data;

      // Montar objeto completo do usuário incluindo dados do paciente
      const userData = {
        ...usuario,
        perfil: perfil || usuario.perfil,
        // Adicionar ID e dados do paciente
        ...(paciente && {
          paciente_id: paciente.id,
          paciente: paciente
        })
      };

      localStorage.setItem('@SaudeSistema:token', token);
      localStorage.setItem('@SaudeSistema:user', JSON.stringify(userData));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);

      return { success: true, perfil: userData.perfil };
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

      const { token, usuario, paciente, medico, perfil } = response.data;

      // Montar objeto completo do usuário incluindo dados específicos do perfil
      const userData = {
        ...usuario,
        perfil: perfil || usuario.perfil,
        // Adicionar ID e dados do paciente se for PACIENTE
        ...(paciente && {
          paciente_id: paciente.id,
          paciente: paciente
        }),
        // Adicionar ID e dados do médico se for MEDICO
        ...(medico && {
          medico_id: medico.id,
          medico: medico
        })
      };

      localStorage.setItem('@SaudeSistema:token', token);
      localStorage.setItem('@SaudeSistema:user', JSON.stringify(userData));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);

      return { success: true, perfil: userData.perfil };
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

  // Atualizar dados do usuário
  const updateUser = (newData) => {
    const updatedUser = {
      ...user,
      ...newData
    };
    
    setUser(updatedUser);
    localStorage.setItem('@SaudeSistema:user', JSON.stringify(updatedUser));
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

  // Verifica se é médico
  const isMedico = () => hasRole('MEDICO');

  // Verifica se é recepcionista
  const isRecepcionista = () => hasRole('RECEPCIONISTA');

  // Retorna o ID do paciente se o usuário for paciente
  const getPacienteId = () => {
    if (!user || !isPaciente()) return null;
    return user.paciente_id || user.paciente?.id || null;
  };

  // Retorna o ID do médico se o usuário for médico
  const getMedicoId = () => {
    if (!user || !isMedico()) return null;
    return user.medico_id || user.medico?.id || null;
  };

  // Retorna dados do paciente
  const getPacienteData = () => {
    if (!user || !isPaciente()) return null;
    return user.paciente || null;
  };

  // Retorna dados do médico
  const getMedicoData = () => {
    if (!user || !isMedico()) return null;
    return user.medico || null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginPaciente,
      loginUsuario,
      logout,
      updateUser,
      hasRole,
      isAdmin,
      isPaciente,
      isMedico,
      isRecepcionista,
      getPacienteId,
      getMedicoId,
      getPacienteData,
      getMedicoData,
      signed: !!user
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
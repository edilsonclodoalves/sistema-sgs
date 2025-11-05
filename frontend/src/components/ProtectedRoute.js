import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Alert } from 'react-bootstrap';

// ProtectedRoute com verificação de perfil
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login-paciente" />;
  }

  // Se allowedRoles for especificado, verifica se o usuário tem permissão
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.perfil)) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Acesso Negado</Alert.Heading>
          <p>Você não tem permissão para acessar esta página.</p>
          <hr />
          <p className="mb-0">
            Seu perfil: <strong>{user.perfil}</strong>
          </p>
        </Alert>
      </Container>
    );
  }

  return children;
};

// Rota específica para administradores
export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
      {children}
    </ProtectedRoute>
  );
};

// Rota específica para pacientes
export const PacienteRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['PACIENTE']}>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;

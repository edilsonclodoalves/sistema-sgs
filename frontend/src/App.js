import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/custom.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import AgendarConsulta from './pages/AgendarConsulta';
import MinhasConsultas from './pages/MinhasConsultas';
import HistoricoMedico from './pages/HistoricoMedico';
import FilasAtendimento from './pages/FilasAtendimento';
import UnidadesSaude from './pages/UnidadesSaude';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
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

  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navigation />
        <main className="flex-grow-1 bg-light">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/filas" element={<FilasAtendimento />} />
            <Route path="/unidades" element={<UnidadesSaude />} />

            {/* Protected Routes */}
            <Route 
              path="/agendar" 
              element={
                <ProtectedRoute>
                  <AgendarConsulta />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/consultas" 
              element={
                <ProtectedRoute>
                  <MinhasConsultas />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/historico" 
              element={
                <ProtectedRoute>
                  <HistoricoMedico />
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-dark text-white py-4 mt-auto">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <h5>Sistema de Gestão de Saúde</h5>
                <p className="text-muted">
                  Acesso facilitado aos serviços de saúde municipal
                </p>
              </div>
              <div className="col-md-6 text-md-end">
                <p className="mb-1">
                  <i className="bi bi-telephone me-2"></i>
                  Central de Atendimento: 0800 123 4567
                </p>
                <p className="mb-1">
                  <i className="bi bi-envelope me-2"></i>
                  contato@saude.gov.br
                </p>
                <p className="text-muted small mt-3">
                  © 2025 Sistema de Gestão de Saúde. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </div>
        </footer>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

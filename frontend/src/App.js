import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/custom.css';

import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import { AdminRoute, PacienteRoute } from './components/ProtectedRoute';

// Páginas Públicas
import Home from './pages/Home';
import LoginPaciente from './pages/LoginPaciente';
import LoginUsuario from './pages/LoginUsuario';
import FilasAtendimento from './pages/FilasAtendimento';
import UnidadesSaude from './pages/UnidadesSaude';

// Páginas do Paciente
import PacienteDashboard from './pages/PacienteDashboard';
import PerfilPaciente from './pages/PerfilPaciente';
import AgendarConsultaPaciente from './pages/AgendarConsultaPaciente';
import MinhasConsultas from './pages/MinhasConsultas';
import HistoricoMedico from './pages/HistoricoMedico';

// Páginas do Administrador
import AdminDashboard from './pages/AdminDashboard';
import GerenciarPacientes from './pages/GerenciarPacientes';
import CadastrarPaciente from './pages/CadastrarPaciente';
import EditarPaciente from './pages/EditarPaciente';
import GerenciarConsultas from './pages/GerenciarConsultas';
import AgendarConsultaAdmin from './pages/AgendarConsultaAdmin';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import CadastrarUsuario from './pages/CadastrarUsuario';

function AppContent() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navigation />
        <main className="flex-grow-1 bg-light">
          <Routes>
            {/* ============== ROTAS PÚBLICAS ============== */}
            <Route path="/" element={<Home />} />
            <Route path="/login-paciente" element={<LoginPaciente />} />
            <Route path="/admin" element={<LoginUsuario />} />
            <Route path="/filas" element={<FilasAtendimento />} />
            <Route path="/unidades" element={<UnidadesSaude />} />

            {/* ============== ROTAS DO PACIENTE ============== */}
            <Route
              path="/paciente/dashboard"
              element={
                <PacienteRoute>
                  <PacienteDashboard />
                </PacienteRoute>
              }
            />
            <Route
              path="/paciente/perfil"
              element={
                <PacienteRoute>
                  <PerfilPaciente />
                </PacienteRoute>
              }
            />
            <Route
              path="/paciente/agendar"
              element={
                <PacienteRoute>
                  <AgendarConsultaPaciente />
                </PacienteRoute>
              }
            />
            <Route
              path="/paciente/consultas"
              element={
                <PacienteRoute>
                  <MinhasConsultas />
                </PacienteRoute>
              }
            />
            <Route
              path="/paciente/historico"
              element={
                <PacienteRoute>
                  <HistoricoMedico />
                </PacienteRoute>
              }
            />

            {/* ============== ROTAS DO ADMINISTRADOR ============== */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Gerenciamento de Pacientes */}
            <Route
              path="/admin/pacientes"
              element={
                <AdminRoute>
                  <GerenciarPacientes />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/pacientes/novo"
              element={
                <AdminRoute>
                  <CadastrarPaciente />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/pacientes/:id/editar"
              element={
                <AdminRoute>
                  <EditarPaciente />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/pacientes/:id/historico"
              element={
                <AdminRoute>
                  <HistoricoMedico />
                </AdminRoute>
              }
            />

            {/* Gerenciamento de Consultas */}
            <Route
              path="/admin/consultas"
              element={
                <AdminRoute>
                  <GerenciarConsultas />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/agendar"
              element={
                <AdminRoute>
                  <AgendarConsultaAdmin />
                </AdminRoute>
              }
            />

            {/* Gerenciamento de Usuários */}
            <Route
              path="/admin/usuarios"
              element={
                <AdminRoute>
                  <GerenciarUsuarios />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/usuarios/novo"
              element={
                <AdminRoute>
                  <CadastrarUsuario />
                </AdminRoute>
              }
            />

            {/* ============== ROTA 404 ============== */}
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

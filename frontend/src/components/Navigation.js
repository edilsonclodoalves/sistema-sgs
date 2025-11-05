import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout, isAdmin, isPaciente } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-hospital me-2"></i>
          Sistema de Saúde
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            {/* Menu para usuários não autenticados */}
            {!user && (
              <>
                <Nav.Link as={Link} to="/" className={isActive('/')}>
                  <i className="bi bi-house me-1"></i>
                  Início
                </Nav.Link>
                <Nav.Link as={Link} to="/filas" className={isActive('/filas')}>
                  <i className="bi bi-people me-1"></i>
                  Filas de Atendimento
                </Nav.Link>
                <Nav.Link as={Link} to="/unidades" className={isActive('/unidades')}>
                  <i className="bi bi-geo-alt me-1"></i>
                  Unidades de Saúde
                </Nav.Link>
              </>
            )}

            {/* Menu para Administradores */}
            {user && isAdmin() && (
              <>
                <Nav.Link as={Link} to="/admin/dashboard" className={isActive('/admin/dashboard')}>
                  <i className="bi bi-speedometer2 me-1"></i>
                  Dashboard
                </Nav.Link>
                <NavDropdown title={<><i className="bi bi-people me-1"></i>Pacientes</>} id="pacientes-dropdown">
                  <NavDropdown.Item as={Link} to="/admin/pacientes">
                    <i className="bi bi-list me-2"></i>
                    Gerenciar Pacientes
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/admin/pacientes/novo">
                    <i className="bi bi-plus-lg me-2"></i>
                    Cadastrar Paciente
                  </NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title={<><i className="bi bi-calendar-check me-1"></i>Consultas</>} id="consultas-dropdown">
                  <NavDropdown.Item as={Link} to="/admin/consultas">
                    <i className="bi bi-list me-2"></i>
                    Gerenciar Consultas
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/admin/agendar">
                    <i className="bi bi-calendar-plus me-2"></i>
                    Agendar Consulta
                  </NavDropdown.Item>
                </NavDropdown>
                <Nav.Link as={Link} to="/admin/usuarios" className={isActive('/admin/usuarios')}>
                  <i className="bi bi-person-badge me-1"></i>
                  Usuários
                </Nav.Link>
              </>
            )}

            {/* Menu para Pacientes */}
            {user && isPaciente() && (
              <>
                <Nav.Link as={Link} to="/paciente/dashboard" className={isActive('/paciente/dashboard')}>
                  <i className="bi bi-speedometer2 me-1"></i>
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/paciente/agendar" className={isActive('/paciente/agendar')}>
                  <i className="bi bi-calendar-plus me-1"></i>
                  Agendar Consulta
                </Nav.Link>
                <Nav.Link as={Link} to="/paciente/consultas" className={isActive('/paciente/consultas')}>
                  <i className="bi bi-calendar-check me-1"></i>
                  Minhas Consultas
                </Nav.Link>
                <Nav.Link as={Link} to="/paciente/historico" className={isActive('/paciente/historico')}>
                  <i className="bi bi-file-medical me-1"></i>
                  Histórico Médico
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav>
            {user ? (
              <NavDropdown 
                title={
                  <>
                    <i className="bi bi-person-circle me-1"></i>
                    {user.pessoa?.nome_completo || 'Usuário'}
                  </>
                } 
                id="user-dropdown"
                align="end"
              >
                {isPaciente() && (
                  <>
                    <NavDropdown.Item as={Link} to="/paciente/perfil">
                      <i className="bi bi-person me-2"></i>
                      Meu Perfil
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                  </>
                )}
                <NavDropdown.Item className="text-muted small">
                  <i className="bi bi-shield-check me-2"></i>
                  Perfil: <strong>{user.perfil}</strong>
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sair
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login-paciente">
                  <i className="bi bi-person-circle me-1"></i>
                  Área do Paciente
                </Nav.Link>
                <Nav.Link as={Link} to="/admin">
                  <i className="bi bi-hospital me-1"></i>
                  Área Administrativa
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;

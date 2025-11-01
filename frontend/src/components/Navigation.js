import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-hospital me-2"></i>
          Sistema de Saúde
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              <i className="bi bi-house-door me-1"></i>
              Início
            </Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/agendar">
                  <i className="bi bi-calendar-plus me-1"></i>
                  Agendar Consulta
                </Nav.Link>
                <Nav.Link as={Link} to="/consultas">
                  <i className="bi bi-calendar-check me-1"></i>
                  Minhas Consultas
                </Nav.Link>
                <Nav.Link as={Link} to="/historico">
                  <i className="bi bi-file-medical me-1"></i>
                  Histórico Médico
                </Nav.Link>
                <Nav.Link as={Link} to="/filas">
                  <i className="bi bi-people me-1"></i>
                  Filas de Atendimento
                </Nav.Link>
                <Nav.Link as={Link} to="/unidades">
                  <i className="bi bi-geo-alt me-1"></i>
                  Unidades de Saúde
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
                    {user.nome}
                  </>
                } 
                id="user-dropdown"
              >
                <NavDropdown.Item as={Link} to="/perfil">
                  <i className="bi bi-person me-2"></i>
                  Meu Perfil
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/notificacoes">
                  <i className="bi bi-bell me-2"></i>
                  Notificações
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sair
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Entrar
                </Nav.Link>
                <Nav.Link as={Link} to="/cadastro">
                  <i className="bi bi-person-plus me-1"></i>
                  Cadastrar
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

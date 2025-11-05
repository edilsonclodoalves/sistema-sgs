import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPacientes: 0,
    totalConsultas: 0,
    consultasHoje: 0,
    consultasPendentes: 0
  });
  const [consultasRecentes, setConsultasRecentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas
      const [pacientesRes, consultasRes] = await Promise.all([
        api.get('/pacientes'),
        api.get('/consultas')
      ]);

      const pacientes = pacientesRes.data.pacientes || [];
      const consultas = consultasRes.data.consultas || [];

      const hoje = new Date().toDateString();
      const consultasHoje = consultas.filter(c => 
        new Date(c.data_hora).toDateString() === hoje
      ).length;

      const consultasPendentes = consultas.filter(c => 
        c.status === 'AGENDADA'
      ).length;

      setStats({
        totalPacientes: pacientes.length,
        totalConsultas: consultas.length,
        consultasHoje,
        consultasPendentes
      });

      // Últimas 10 consultas
      setConsultasRecentes(consultas.slice(0, 10));
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2>
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard Administrativo
        </h2>
        <p className="text-muted">
          Bem-vindo(a), {user?.pessoa?.nome_completo || 'Administrador'}
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="shadow-sm border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total de Pacientes</h6>
                  <h2 className="mb-0">{stats.totalPacientes}</h2>
                </div>
                <i className="bi bi-people text-primary" style={{ fontSize: '2.5rem' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="shadow-sm border-success">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total de Consultas</h6>
                  <h2 className="mb-0">{stats.totalConsultas}</h2>
                </div>
                <i className="bi bi-calendar-check text-success" style={{ fontSize: '2.5rem' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="shadow-sm border-info">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Consultas Hoje</h6>
                  <h2 className="mb-0">{stats.consultasHoje}</h2>
                </div>
                <i className="bi bi-calendar-event text-info" style={{ fontSize: '2.5rem' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="shadow-sm border-warning">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Consultas Pendentes</h6>
                  <h2 className="mb-0">{stats.consultasPendentes}</h2>
                </div>
                <i className="bi bi-clock-history text-warning" style={{ fontSize: '2.5rem' }}></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Menu de Acesso Rápido */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">
                <i className="bi bi-grid me-2"></i>
                Acesso Rápido
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} lg={3} className="mb-3">
                  <Link to="/admin/pacientes" className="text-decoration-none">
                    <Card className="text-center hover-shadow h-100">
                      <Card.Body>
                        <i className="bi bi-people text-primary" style={{ fontSize: '2rem' }}></i>
                        <h6 className="mt-2 mb-0">Gerenciar Pacientes</h6>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>

                <Col md={6} lg={3} className="mb-3">
                  <Link to="/admin/consultas" className="text-decoration-none">
                    <Card className="text-center hover-shadow h-100">
                      <Card.Body>
                        <i className="bi bi-calendar-check text-success" style={{ fontSize: '2rem' }}></i>
                        <h6 className="mt-2 mb-0">Gerenciar Consultas</h6>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>

                <Col md={6} lg={3} className="mb-3">
                  <Link to="/admin/agendar" className="text-decoration-none">
                    <Card className="text-center hover-shadow h-100">
                      <Card.Body>
                        <i className="bi bi-calendar-plus text-info" style={{ fontSize: '2rem' }}></i>
                        <h6 className="mt-2 mb-0">Agendar Consulta</h6>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>

                <Col md={6} lg={3} className="mb-3">
                  <Link to="/admin/usuarios" className="text-decoration-none">
                    <Card className="text-center hover-shadow h-100">
                      <Card.Body>
                        <i className="bi bi-person-badge text-warning" style={{ fontSize: '2rem' }}></i>
                        <h6 className="mt-2 mb-0">Gerenciar Usuários</h6>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Consultas Recentes */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Consultas Recentes
              </h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
              ) : consultasRecentes.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Paciente</th>
                        <th>Especialidade</th>
                        <th>Data/Hora</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultasRecentes.map((consulta) => (
                        <tr key={consulta.id}>
                          <td>#{consulta.id}</td>
                          <td>{consulta.paciente_nome || 'N/A'}</td>
                          <td>{consulta.especialidade}</td>
                          <td>
                            {new Date(consulta.data_hora).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(consulta.data_hora).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <Badge 
                              bg={
                                consulta.status === 'AGENDADA' ? 'success' :
                                consulta.status === 'CONFIRMADA' ? 'info' :
                                consulta.status === 'CANCELADA' ? 'danger' :
                                'secondary'
                              }
                            >
                              {consulta.status}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              as={Link}
                              to={`/admin/consultas/${consulta.id}`}
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">Nenhuma consulta registrada</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const PacienteDashboard = () => {
  const { user } = useAuth();
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarConsultas();
  }, []);

  const carregarConsultas = async () => {
    try {
      setLoading(true);
      // Carrega apenas as consultas do paciente logado
      const response = await api.get('/consultas/minhas');
      setConsultas(response.data.consultas || []);
      setError('');
    } catch (err) {
      setError('Erro ao carregar suas consultas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>
          <i className="bi bi-speedometer2 me-2"></i>
          Bem-vindo(a), {user?.pessoa?.nome_completo || 'Paciente'}
        </h2>
        <p className="text-muted">Gerencie suas consultas e acompanhe seu histórico médico</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Cards de Acesso Rápido */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="h-100 shadow-sm hover-shadow">
            <Card.Body className="text-center">
              <i className="bi bi-calendar-plus text-primary" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3">Agendar Consulta</h5>
              <p className="text-muted small">Agende uma nova consulta</p>
              <Link to="/paciente/agendar" className="btn btn-primary">
                Agendar
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="h-100 shadow-sm hover-shadow">
            <Card.Body className="text-center">
              <i className="bi bi-calendar-check text-success" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3">Minhas Consultas</h5>
              <p className="text-muted small">Visualize suas consultas</p>
              <Link to="/paciente/consultas" className="btn btn-success">
                Ver Consultas
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="h-100 shadow-sm hover-shadow">
            <Card.Body className="text-center">
              <i className="bi bi-file-medical text-info" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3">Histórico Médico</h5>
              <p className="text-muted small">Veja seu histórico</p>
              <Link to="/paciente/historico" className="btn btn-info">
                Ver Histórico
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="h-100 shadow-sm hover-shadow">
            <Card.Body className="text-center">
              <i className="bi bi-person-circle text-warning" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3">Meu Perfil</h5>
              <p className="text-muted small">Atualize seus dados</p>
              <Link to="/paciente/perfil" className="btn btn-warning">
                Editar Perfil
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Próximas Consultas */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                Próximas Consultas
              </h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
              ) : consultas.length > 0 ? (
                <div className="list-group list-group-flush">
                  {consultas.slice(0, 5).map((consulta) => (
                    <div key={consulta.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{consulta.especialidade}</h6>
                          <p className="mb-1 text-muted small">
                            <i className="bi bi-calendar me-1"></i>
                            {new Date(consulta.data_hora).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(consulta.data_hora).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="mb-0 text-muted small">
                            <i className="bi bi-geo-alt me-1"></i>
                            {consulta.local}
                          </p>
                        </div>
                        <span className={`badge bg-${consulta.status === 'AGENDADA' ? 'success' : 'secondary'}`}>
                          {consulta.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">Você não tem consultas agendadas</p>
                  <Link to="/paciente/agendar" className="btn btn-primary">
                    Agendar Consulta
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Informações Importantes */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm border-info">
            <Card.Body>
              <h5 className="text-info">
                <i className="bi bi-info-circle me-2"></i>
                Informações Importantes
              </h5>
              <ul className="mb-0">
                <li>Chegue com 15 minutos de antecedência para suas consultas</li>
                <li>Traga seus documentos e cartão do SUS</li>
                <li>Em caso de impossibilidade de comparecer, cancele com antecedência</li>
                <li>Mantenha seus dados cadastrais atualizados</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PacienteDashboard;

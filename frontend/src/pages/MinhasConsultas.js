import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const MinhasConsultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarConsultas();
  }, []);

  const carregarConsultas = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Busca todas as consultas do backend
      const response = await api.get('/consultas');
      
      const consultasData = Array.isArray(response.data)
        ? response.data
        : response.data.consultas || [];
      
      // O backend já deve filtrar as consultas do paciente logado via middleware
      setConsultas(consultasData);
      
    } catch (err) {
      console.error('Erro ao carregar consultas:', err);
      setError('Não foi possível carregar suas consultas.');
      setConsultas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (consultaId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      return;
    }

    try {
      await api.put(`/consultas/${consultaId}`, {
        status: 'CANCELADA'
      });
      
      toast.success('Consulta cancelada com sucesso!');
      carregarConsultas();
      
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao cancelar consulta';
      toast.error(message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'AGENDADA': 'success',
      'CONFIRMADA': 'info',
      'REALIZADA': 'secondary',
      'CANCELADA': 'danger',
      'FALTOU': 'warning'
    };
    return badges[status] || 'secondary';
  };

  const formatarData = (dataHora) => {
    if (!dataHora) return 'N/A';
    const date = new Date(dataHora);
    return date.toLocaleDateString('pt-BR');
  };

  const formatarHora = (dataHora) => {
    if (!dataHora) return 'N/A';
    const date = new Date(dataHora);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const isPodeAcaoConsulta = (consulta) => {
    return consulta.status === 'AGENDADA' || consulta.status === 'CONFIRMADA';
  };

  // Separar consultas em futuras e passadas
  const agora = new Date();
  const consultasFuturas = consultas.filter(c => 
    new Date(c.data_hora) >= agora && (c.status === 'AGENDADA' || c.status === 'CONFIRMADA')
  );
  const consultasPassadas = consultas.filter(c => 
    new Date(c.data_hora) < agora || (c.status !== 'AGENDADA' && c.status !== 'CONFIRMADA')
  );

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>
          <i className="bi bi-calendar-check me-2"></i>
          Minhas Consultas
        </h2>
        <p className="text-muted">Visualize e gerencie suas consultas médicas</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <Link to="/paciente/agendar" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i>
            Agendar Nova Consulta
          </Link>
        </Col>
      </Row>

      {/* Próximas Consultas */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-success text-white">
          <h5 className="mb-0">
            <i className="bi bi-calendar-event me-2"></i>
            Próximas Consultas
          </h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : consultasFuturas.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Médico</th>
                    <th>Tipo</th>
                    <th>Local</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {consultasFuturas.map((consulta) => (
                    <tr key={consulta.id}>
                      <td>{formatarData(consulta.data_hora)}</td>
                      <td><strong>{formatarHora(consulta.data_hora)}</strong></td>
                      <td>{consulta.medico?.pessoa?.nome_completo || 'N/A'}</td>
                      <td>{consulta.tipo || 'N/A'}</td>
                      <td>{consulta.local || 'Unidade Central'}</td>
                      <td>
                        <Badge bg={getStatusBadge(consulta.status)}>
                          {consulta.status}
                        </Badge>
                      </td>
                      <td>
                        {isPodeAcaoConsulta(consulta) && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleCancelar(consulta.id)}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Cancelar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3">Você não tem consultas agendadas</p>
              <Link to="/paciente/agendar" className="btn btn-primary">
                Agendar Consulta
              </Link>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Histórico de Consultas */}
      <Card className="shadow-sm">
        <Card.Header className="bg-secondary text-white">
          <h5 className="mb-0">
            <i className="bi bi-clock-history me-2"></i>
            Histórico de Consultas
          </h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : consultasPassadas.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Médico</th>
                    <th>Tipo</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {consultasPassadas.map((consulta) => (
                    <tr key={consulta.id}>
                      <td>{formatarData(consulta.data_hora)}</td>
                      <td>{formatarHora(consulta.data_hora)}</td>
                      <td>{consulta.medico?.pessoa?.nome_completo || 'N/A'}</td>
                      <td>{consulta.tipo || 'N/A'}</td>
                      <td>
                        <Badge bg={getStatusBadge(consulta.status)}>
                          {consulta.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3">Sem histórico de consultas</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Informações */}
      <Card className="shadow-sm mt-4 border-info">
        <Card.Body>
          <h6 className="text-info">
            <i className="bi bi-info-circle me-2"></i>
            Informações Importantes
          </h6>
          <ul className="mb-0 small">
            <li>Consultas podem ser canceladas até 24h antes do horário agendado</li>
            <li>Em caso de emergência, procure o Pronto Atendimento</li>
            <li>Lembre-se de trazer documentos e cartão do SUS</li>
            <li>Chegue com 15 minutos de antecedência</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MinhasConsultas;

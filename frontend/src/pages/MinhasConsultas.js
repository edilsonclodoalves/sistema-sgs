import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import consultaService from '../services/consultaService';

const MinhasConsultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [consultaSelecionada, setConsultaSelecionada] = useState(null);

  useEffect(() => {
    carregarConsultas();
  }, []);

  const carregarConsultas = async () => {
    try {
      const data = await consultaService.listarConsultas();
      setConsultas(data);
    } catch (error) {
      toast.error('Erro ao carregar consultas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = (consulta) => {
    setConsultaSelecionada(consulta);
    setShowCancelModal(true);
  };

  const confirmarCancelamento = async () => {
    try {
      await consultaService.cancelarConsulta(consultaSelecionada.id);
      toast.success('Consulta cancelada com sucesso!');
      setShowCancelModal(false);
      carregarConsultas();
    } catch (error) {
      toast.error('Erro ao cancelar consulta');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'agendada': { variant: 'primary', icon: 'calendar-check' },
      'confirmada': { variant: 'success', icon: 'check-circle' },
      'cancelada': { variant: 'danger', icon: 'x-circle' },
      'realizada': { variant: 'secondary', icon: 'check-all' }
    };
    
    const config = statusMap[status] || statusMap['agendada'];
    return (
      <Badge bg={config.variant}>
        <i className={`bi bi-${config.icon} me-1`}></i>
        {status?.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary"></div>
      </Container>
    );
  }

  const consultasAgendadas = consultas.filter(c => c.status === 'agendada' || c.status === 'confirmada');
  const consultasPassadas = consultas.filter(c => c.status === 'realizada' || c.status === 'cancelada');

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>
            <i className="bi bi-calendar-check text-primary me-2"></i>
            Minhas Consultas
          </h2>
        </Col>
      </Row>

      {/* Consultas Agendadas */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Consultas Agendadas</h5>
            </Card.Header>
            <Card.Body>
              {consultasAgendadas.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Médico</th>
                      <th>Especialidade</th>
                      <th>Unidade</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultasAgendadas.map(consulta => (
                      <tr key={consulta.id}>
                        <td>{new Date(consulta.data_consulta).toLocaleDateString('pt-BR')}</td>
                        <td><Badge bg="info">{consulta.horario}</Badge></td>
                        <td>Dr(a). {consulta.medico?.nome}</td>
                        <td>{consulta.especialidade}</td>
                        <td>{consulta.unidade}</td>
                        <td>{getStatusBadge(consulta.status)}</td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="outline-danger"
                            onClick={() => handleCancelar(consulta)}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Cancelar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-calendar-x" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-2">Você não possui consultas agendadas</p>
                  <Button variant="primary" href="/agendar">
                    Agendar Nova Consulta
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Histórico de Consultas */}
      {consultasPassadas.length > 0 && (
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Histórico de Consultas</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Médico</th>
                      <th>Especialidade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultasPassadas.map(consulta => (
                      <tr key={consulta.id}>
                        <td>{new Date(consulta.data_consulta).toLocaleDateString('pt-BR')}</td>
                        <td>{consulta.horario}</td>
                        <td>Dr(a). {consulta.medico?.nome}</td>
                        <td>{consulta.especialidade}</td>
                        <td>{getStatusBadge(consulta.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal de Confirmação de Cancelamento */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancelar Consulta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja cancelar esta consulta?</p>
          {consultaSelecionada && (
            <div className="bg-light p-3 rounded">
              <p className="mb-1"><strong>Data:</strong> {new Date(consultaSelecionada.data_consulta).toLocaleDateString('pt-BR')}</p>
              <p className="mb-1"><strong>Horário:</strong> {consultaSelecionada.horario}</p>
              <p className="mb-0"><strong>Médico:</strong> Dr(a). {consultaSelecionada.medico?.nome}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Não, manter consulta
          </Button>
          <Button variant="danger" onClick={confirmarCancelamento}>
            Sim, cancelar consulta
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MinhasConsultas;

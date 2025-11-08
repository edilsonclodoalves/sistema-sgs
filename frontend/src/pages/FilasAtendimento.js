import React from 'react';
import { Container, Row, Col, Card, Badge, ProgressBar } from 'react-bootstrap';

const FilasAtendimento = () => {
  // Dados mockados - em produção viriam da API
  const filas = [
    { id: 1, unidade: 'UBS Centro', tipo: 'Clínica Geral', aguardando: 8, atendidos: 15, tempoMedio: '25 min' },
    { id: 2, unidade: 'UBS Centro', tipo: 'Pediatria', aguardando: 5, atendidos: 12, tempoMedio: '30 min' },
    { id: 3, unidade: 'UBS Norte', tipo: 'Clínica Geral', aguardando: 12, atendidos: 18, tempoMedio: '35 min' },
    { id: 4, unidade: 'UBS Norte', tipo: 'Odontologia', aguardando: 3, atendidos: 8, tempoMedio: '40 min' },
    { id: 5, unidade: 'UBS Sul', tipo: 'Clínica Geral', aguardando: 6, atendidos: 20, tempoMedio: '20 min' },
    { id: 6, unidade: 'UBS Sul', tipo: 'Enfermagem', aguardando: 4, atendidos: 10, tempoMedio: '15 min' },
  ];

  const getFilaStatus = (aguardando) => {
    if (aguardando <= 5) return { color: 'success', label: 'Baixa' };
    if (aguardando <= 10) return { color: 'warning', label: 'Moderada' };
    return { color: 'danger', label: 'Alta' };
  };

  const calculateProgress = (atendidos, aguardando) => {
    const total = atendidos + aguardando;
    return (atendidos / total) * 100;
  };

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h2>
          <i className="bi bi-people me-2"></i>
          Filas de Atendimento
        </h2>
        <p className="text-muted">
          Acompanhe em tempo real as filas nas unidades de saúde
        </p>
      </div>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-info">
            <Card.Body>
              <div className="d-flex align-items-center">
                <i className="bi bi-info-circle text-info me-3" style={{ fontSize: '2rem' }}></i>
                <div>
                  <h6 className="mb-1">Informação</h6>
                  <p className="mb-0 small text-muted">
                    As informações são atualizadas automaticamente a cada 5 minutos. 
                    O tempo médio de espera é uma estimativa baseada nos atendimentos recentes.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {filas.map((fila) => {
          const status = getFilaStatus(fila.aguardando);
          const progress = calculateProgress(fila.atendidos, fila.aguardando);

          return (
            <Col key={fila.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm hover-shadow">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">{fila.unidade}</h5>
                  <small className="text-muted">{fila.tipo}</small>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Status da Fila:</span>
                      <Badge bg={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                    <ProgressBar 
                      variant={status.color} 
                      now={progress} 
                      className="mb-3"
                      style={{ height: '8px' }}
                    />
                  </div>

                  <Row className="text-center">
                    <Col xs={4}>
                      <div className="p-2">
                        <h3 className="mb-0 text-danger">{fila.aguardando}</h3>
                        <small className="text-muted">Aguardando</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="p-2">
                        <h3 className="mb-0 text-success">{fila.atendidos}</h3>
                        <small className="text-muted">Atendidos</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="p-2">
                        <h3 className="mb-0 text-info">{fila.tempoMedio}</h3>
                        <small className="text-muted">Tempo Médio</small>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
                <Card.Footer className="bg-light text-muted small">
                  <i className="bi bi-clock-history me-1"></i>
                  Atualizado há 2 minutos
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>
                <i className="bi bi-question-circle me-2"></i>
                Como Funciona?
              </h5>
              <Row className="mt-3">
                <Col md={4}>
                  <h6>
                    <Badge bg="success" className="me-2">Baixa</Badge>
                    Fila Baixa
                  </h6>
                  <p className="small text-muted">
                    Até 5 pessoas aguardando. Tempo de espera geralmente menor que 30 minutos.
                  </p>
                </Col>
                <Col md={4}>
                  <h6>
                    <Badge bg="warning" className="me-2">Moderada</Badge>
                    Fila Moderada
                  </h6>
                  <p className="small text-muted">
                    Entre 6 e 10 pessoas aguardando. Tempo de espera entre 30 e 60 minutos.
                  </p>
                </Col>
                <Col md={4}>
                  <h6>
                    <Badge bg="danger" className="me-2">Alta</Badge>
                    Fila Alta
                  </h6>
                  <p className="small text-muted">
                    Mais de 10 pessoas aguardando. Tempo de espera pode ultrapassar 1 hora.
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FilasAtendimento;

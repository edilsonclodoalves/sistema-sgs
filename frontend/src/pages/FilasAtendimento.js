import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ProgressBar } from 'react-bootstrap';

const FilasAtendimento = () => {
  const [filas, setFilas] = useState([
    {
      id: 1,
      unidade: 'UBS Centro',
      tipo: 'Clínico Geral',
      pessoasNaFila: 8,
      tempoEstimado: '40 min',
      statusCor: 'warning'
    },
    {
      id: 2,
      unidade: 'UBS Centro',
      tipo: 'Pediatria',
      pessoasNaFila: 3,
      tempoEstimado: '15 min',
      statusCor: 'success'
    },
    {
      id: 3,
      unidade: 'UBS Vila Nova',
      tipo: 'Clínico Geral',
      pessoasNaFila: 12,
      tempoEstimado: '60 min',
      statusCor: 'danger'
    },
    {
      id: 4,
      unidade: 'UBS Jardim das Flores',
      tipo: 'Ginecologia',
      pessoasNaFila: 5,
      tempoEstimado: '25 min',
      statusCor: 'warning'
    },
    {
      id: 5,
      unidade: 'Hospital Municipal',
      tipo: 'Emergência',
      pessoasNaFila: 15,
      tempoEstimado: '45 min',
      statusCor: 'danger'
    }
  ]);

  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());

  useEffect(() => {
    // Simulação de atualização em tempo real
    const interval = setInterval(() => {
      setUltimaAtualizacao(new Date());
    }, 30000); // Atualiza a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = (pessoasNaFila) => {
    if (pessoasNaFila <= 5) {
      return { nivel: 'Baixo', cor: 'success', porcentagem: 33 };
    } else if (pessoasNaFila <= 10) {
      return { nivel: 'Moderado', cor: 'warning', porcentagem: 66 };
    } else {
      return { nivel: 'Alto', cor: 'danger', porcentagem: 100 };
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2>
                    <i className="bi bi-people text-primary me-2"></i>
                    Filas de Atendimento
                  </h2>
                  <p className="text-muted mb-0">
                    Acompanhe o tempo de espera nas unidades de saúde em tempo real
                  </p>
                </div>
                <div className="text-end">
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    Última atualização: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {filas.map(fila => {
          const statusInfo = getStatusInfo(fila.pessoasNaFila);
          
          return (
            <Col md={6} lg={4} key={fila.id}>
              <Card className="h-100 shadow-sm">
                <Card.Header className={`bg-${fila.statusCor} bg-opacity-10`}>
                  <h5 className="mb-1">{fila.unidade}</h5>
                  <small className="text-muted">{fila.tipo}</small>
                </Card.Header>
                <Card.Body>
                  <div className="text-center mb-3">
                    <div className="display-4 fw-bold text-primary">
                      {fila.pessoasNaFila}
                    </div>
                    <p className="text-muted mb-0">pessoas na fila</p>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Nível de ocupação</small>
                      <small><Badge bg={statusInfo.cor}>{statusInfo.nivel}</Badge></small>
                    </div>
                    <ProgressBar 
                      now={statusInfo.porcentagem} 
                      variant={statusInfo.cor}
                      animated
                    />
                  </div>

                  <div className="d-flex align-items-center justify-content-center bg-light rounded p-3">
                    <i className="bi bi-clock text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
                    <div>
                      <small className="text-muted d-block">Tempo estimado</small>
                      <strong className="text-primary">{fila.tempoEstimado}</strong>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row className="mt-4">
        <Col>
          <Card className="border-info">
            <Card.Body>
              <h5>
                <i className="bi bi-info-circle text-info me-2"></i>
                Informações Importantes
              </h5>
              <ul className="mb-0">
                <li>Os tempos são estimativas e podem variar conforme a complexidade dos atendimentos</li>
                <li>Casos de emergência têm prioridade no atendimento</li>
                <li>Chegue com antecedência para realizar seu cadastro na recepção</li>
                <li>As informações são atualizadas automaticamente a cada 30 segundos</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FilasAtendimento;

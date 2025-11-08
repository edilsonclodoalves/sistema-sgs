import React from 'react';
import { Container, Row, Col, Card, Badge, ListGroup } from 'react-bootstrap';

const UnidadesSaude = () => {
  // Dados mockados - em produção viriam da API
  const unidades = [
    {
      id: 1,
      nome: 'UBS Centro',
      endereco: 'Rua Principal, 123 - Centro',
      telefone: '(00) 3333-1111',
      horario: 'Segunda a Sexta: 7h às 19h',
      servicos: ['Clínica Geral', 'Pediatria', 'Ginecologia', 'Enfermagem', 'Vacinação'],
      status: 'Aberta'
    },
    {
      id: 2,
      nome: 'UBS Norte',
      endereco: 'Av. Norte, 456 - Bairro Norte',
      telefone: '(00) 3333-2222',
      horario: 'Segunda a Sexta: 7h às 17h',
      servicos: ['Clínica Geral', 'Odontologia', 'Psicologia', 'Enfermagem'],
      status: 'Aberta'
    },
    {
      id: 3,
      nome: 'UBS Sul',
      endereco: 'Rua do Sul, 789 - Bairro Sul',
      telefone: '(00) 3333-3333',
      horario: 'Segunda a Sexta: 7h às 19h\nSábados: 8h às 12h',
      servicos: ['Clínica Geral', 'Pediatria', 'Enfermagem', 'Vacinação', 'Farmácia'],
      status: 'Aberta'
    },
    {
      id: 4,
      nome: 'UBS Leste',
      endereco: 'Praça do Leste, 321 - Bairro Leste',
      telefone: '(00) 3333-4444',
      horario: 'Segunda a Sexta: 8h às 18h',
      servicos: ['Clínica Geral', 'Cardiologia', 'Dermatologia', 'Enfermagem'],
      status: 'Aberta'
    },
    {
      id: 5,
      nome: 'UBS Oeste',
      endereco: 'Av. Oeste, 654 - Bairro Oeste',
      telefone: '(00) 3333-5555',
      horario: 'Segunda a Sexta: 7h às 17h',
      servicos: ['Clínica Geral', 'Pediatria', 'Nutrição', 'Fisioterapia'],
      status: 'Aberta'
    },
    {
      id: 6,
      nome: 'Pronto Atendimento 24h',
      endereco: 'Rua da Emergência, 100 - Centro',
      telefone: '(00) 3333-9999',
      horario: '24 horas por dia, todos os dias',
      servicos: ['Emergência', 'Clínica Geral', 'Ortopedia', 'Raio-X'],
      status: '24h',
      destaque: true
    }
  ];

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h2>
          <i className="bi bi-geo-alt me-2"></i>
          Unidades de Saúde
        </h2>
        <p className="text-muted">
          Encontre a unidade de saúde mais próxima de você
        </p>
      </div>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-info">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={8}>
                  <h6>
                    <i className="bi bi-telephone me-2"></i>
                    Central de Atendimento
                  </h6>
                  <p className="mb-0">
                    <strong>0800 123 4567</strong> - Segunda a Sexta, 7h às 19h
                  </p>
                </Col>
                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <Badge bg="success" className="p-2">
                    <i className="bi bi-whatsapp me-1"></i>
                    WhatsApp: (00) 00000-0000
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {unidades.map((unidade) => (
          <Col key={unidade.id} md={6} lg={4} className="mb-4">
            <Card 
              className={`h-100 shadow-sm hover-shadow ${unidade.destaque ? 'border-danger' : ''}`}
            >
              <Card.Header className={unidade.destaque ? 'bg-danger text-white' : 'bg-light'}>
                <h5 className="mb-0">{unidade.nome}</h5>
                {unidade.status === '24h' && (
                  <Badge bg="light" text="danger" className="mt-1">
                    Atendimento 24 horas
                  </Badge>
                )}
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <h6 className="text-muted mb-2">
                    <i className="bi bi-geo-alt me-2"></i>
                    Endereço
                  </h6>
                  <p className="mb-0">{unidade.endereco}</p>
                </div>

                <div className="mb-3">
                  <h6 className="text-muted mb-2">
                    <i className="bi bi-telephone me-2"></i>
                    Telefone
                  </h6>
                  <p className="mb-0">
                    <a href={`tel:${unidade.telefone.replace(/\D/g, '')}`}>
                      {unidade.telefone}
                    </a>
                  </p>
                </div>

                <div className="mb-3">
                  <h6 className="text-muted mb-2">
                    <i className="bi bi-clock me-2"></i>
                    Horário de Funcionamento
                  </h6>
                  <p className="mb-0 small" style={{ whiteSpace: 'pre-line' }}>
                    {unidade.horario}
                  </p>
                </div>

                <div>
                  <h6 className="text-muted mb-2">
                    <i className="bi bi-heart-pulse me-2"></i>
                    Serviços Oferecidos
                  </h6>
                  <div className="d-flex flex-wrap gap-1">
                    {unidade.servicos.map((servico, index) => (
                      <Badge 
                        key={index} 
                        bg={unidade.destaque ? 'danger' : 'primary'} 
                        className="mb-1"
                      >
                        {servico}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card.Body>
              <Card.Footer className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <Badge bg={unidade.status === '24h' ? 'danger' : 'success'}>
                    <i className="bi bi-circle-fill me-1"></i>
                    {unidade.status}
                  </Badge>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(unidade.endereco)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="bi bi-map me-1"></i>
                    Ver no Mapa
                  </a>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>
                <i className="bi bi-info-circle me-2"></i>
                Informações Importantes
              </h5>
              <Row className="mt-3">
                <Col md={6}>
                  <h6>Documentos Necessários</h6>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Documento de identidade (RG ou CNH)
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Cartão do SUS
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Comprovante de residência
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <h6>Em Caso de Emergência</h6>
                  <div className="alert alert-danger">
                    <h5 className="alert-heading mb-2">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Emergências
                    </h5>
                    <p className="mb-0">
                      <strong>SAMU: 192</strong><br />
                      <strong>Pronto Atendimento 24h:</strong> (00) 3333-9999
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UnidadesSaude;

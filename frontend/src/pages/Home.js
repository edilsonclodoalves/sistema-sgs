import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 mb-3">
                Sistema de Gestão de Saúde
              </h1>
              <p className="lead mb-4">
                Acesso facilitado aos serviços de saúde municipal. 
                Agende consultas, acompanhe seu histórico médico e muito mais.
              </p>
              <div className="d-flex gap-3">
                <Link to="/login-paciente" className="btn btn-light btn-lg">
                  <i className="bi bi-person-circle me-2"></i>
                  Área do Paciente
                </Link>
                <Link to="/admin" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-hospital me-2"></i>
                  Área Administrativa
                </Link>
              </div>
            </Col>
            <Col lg={6} className="text-center d-none d-lg-block">
              <i className="bi bi-hospital" style={{ fontSize: '10rem', opacity: 0.3 }}></i>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Services Section */}
      <Container className="py-5">
        <h2 className="text-center mb-5">Nossos Serviços</h2>
        <Row>
          <Col md={6} lg={3} className="mb-4">
            <Card className="h-100 text-center shadow-sm hover-shadow">
              <Card.Body>
                <i className="bi bi-calendar-plus text-primary" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3">Agendamento Online</h5>
                <p className="text-muted">
                  Agende suas consultas de forma rápida e prática
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className="h-100 text-center shadow-sm hover-shadow">
              <Card.Body>
                <i className="bi bi-file-medical text-success" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3">Histórico Médico</h5>
                <p className="text-muted">
                  Acesse seu histórico completo de atendimentos
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className="h-100 text-center shadow-sm hover-shadow">
              <Card.Body>
                <i className="bi bi-people text-info" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3">Filas em Tempo Real</h5>
                <p className="text-muted">
                  Acompanhe as filas de atendimento
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className="h-100 text-center shadow-sm hover-shadow">
              <Card.Body>
                <i className="bi bi-geo-alt text-warning" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3">Unidades de Saúde</h5>
                <p className="text-muted">
                  Encontre a unidade mais próxima
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Quick Access Section */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-5">Acesso Rápido</h2>
          <Row className="justify-content-center">
            <Col md={6} lg={4} className="mb-3">
              <Card className="shadow-sm hover-shadow">
                <Card.Body>
                  <h5>
                    <i className="bi bi-people me-2 text-primary"></i>
                    Ver Filas
                  </h5>
                  <p className="text-muted mb-3">
                    Consulte as filas de atendimento em tempo real
                  </p>
                  <Link to="/filas" className="btn btn-outline-primary w-100">
                    Acessar
                  </Link>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={4} className="mb-3">
              <Card className="shadow-sm hover-shadow">
                <Card.Body>
                  <h5>
                    <i className="bi bi-geo-alt me-2 text-success"></i>
                    Unidades de Saúde
                  </h5>
                  <p className="text-muted mb-3">
                    Encontre endereços e contatos das unidades
                  </p>
                  <Link to="/unidades" className="btn btn-outline-success w-100">
                    Acessar
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Info Section */}
      <Container className="py-5">
        <Row className="align-items-center">
          <Col lg={6} className="mb-4 mb-lg-0">
            <h2>Como Funciona?</h2>
            <div className="mt-4">
              <div className="d-flex mb-3">
                <div className="me-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    1
                  </div>
                </div>
                <div>
                  <h5>Faça seu Cadastro</h5>
                  <p className="text-muted">
                    Procure a recepção da unidade de saúde mais próxima com seus documentos
                  </p>
                </div>
              </div>

              <div className="d-flex mb-3">
                <div className="me-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    2
                  </div>
                </div>
                <div>
                  <h5>Acesse o Sistema</h5>
                  <p className="text-muted">
                    Use seu CPF e data de nascimento para fazer login
                  </p>
                </div>
              </div>

              <div className="d-flex">
                <div className="me-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    3
                  </div>
                </div>
                <div>
                  <h5>Agende suas Consultas</h5>
                  <p className="text-muted">
                    Escolha data, horário e especialidade de forma online
                  </p>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={6}>
            <Card className="shadow border-primary">
              <Card.Body className="p-4">
                <h4 className="mb-3">
                  <i className="bi bi-telephone me-2"></i>
                  Central de Atendimento
                </h4>
                <p className="mb-2">
                  <strong>Telefone:</strong> 0800 123 4567
                </p>
                <p className="mb-2">
                  <strong>WhatsApp:</strong> (12) 34567-8900
                </p>
                <p className="mb-2">
                  <strong>Email:</strong> contato@saude.gov.br
                </p>
                <p className="mb-0">
                  <strong>Horário:</strong> Segunda a Sexta, 7h às 19h
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;

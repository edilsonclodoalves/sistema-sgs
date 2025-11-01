import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: 'bi-calendar-plus',
      title: 'Agendamento Online',
      description: 'Agende consultas médicas de forma rápida e prática',
      link: '/agendar',
      color: 'primary'
    },
    {
      icon: 'bi-file-medical',
      title: 'Histórico Médico',
      description: 'Acesse seu histórico completo de consultas e exames',
      link: '/historico',
      color: 'success'
    },
    {
      icon: 'bi-people',
      title: 'Filas de Atendimento',
      description: 'Consulte filas e tempo de espera em tempo real',
      link: '/filas',
      color: 'info'
    },
    {
      icon: 'bi-syringe',
      title: 'Campanhas de Vacinação',
      description: 'Receba notificações sobre campanhas e vacinas',
      link: '/notificacoes',
      color: 'warning'
    },
    {
      icon: 'bi-geo-alt',
      title: 'Unidades de Saúde',
      description: 'Encontre unidades de saúde próximas a você',
      link: '/unidades',
      color: 'danger'
    },
    {
      icon: 'bi-star',
      title: 'Avaliação de Serviços',
      description: 'Avalie o atendimento e ajude a melhorar',
      link: '/avaliacoes',
      color: 'secondary'
    }
  ];

  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col>
          <div className="text-center py-5 bg-light rounded shadow-sm">
            <i className="bi bi-hospital text-primary" style={{ fontSize: '4rem' }}></i>
            <h1 className="display-4 mt-3">Sistema de Gestão de Saúde</h1>
            <p className="lead text-muted">
              {user 
                ? `Bem-vindo(a), ${user.nome}!` 
                : 'Acesso rápido e fácil aos serviços de saúde municipal'}
            </p>
            {!user && (
              <div className="mt-4">
                <Button as={Link} to="/cadastro" variant="primary" size="lg" className="me-3">
                  <i className="bi bi-person-plus me-2"></i>
                  Cadastre-se
                </Button>
                <Button as={Link} to="/login" variant="outline-primary" size="lg">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Entrar
                </Button>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-center mb-4">Nossos Serviços</h2>
        </Col>
      </Row>

      <Row className="g-4">
        {features.map((feature, index) => (
          <Col key={index} md={6} lg={4}>
            <Card className="h-100 shadow-sm hover-shadow">
              <Card.Body className="text-center">
                <i 
                  className={`bi ${feature.icon} text-${feature.color}`} 
                  style={{ fontSize: '3rem' }}
                ></i>
                <Card.Title className="mt-3">{feature.title}</Card.Title>
                <Card.Text className="text-muted">
                  {feature.description}
                </Card.Text>
                {user ? (
                  <Button 
                    as={Link} 
                    to={feature.link} 
                    variant={feature.color}
                    className="mt-2"
                  >
                    Acessar
                  </Button>
                ) : (
                  <Button 
                    as={Link} 
                    to="/login" 
                    variant="outline-secondary"
                    className="mt-2"
                  >
                    Faça login
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Info Section */}
      <Row className="mt-5">
        <Col>
          <Card className="bg-primary text-white">
            <Card.Body className="text-center py-4">
              <h3>
                <i className="bi bi-info-circle me-2"></i>
                Como funciona?
              </h3>
              <Row className="mt-4">
                <Col md={3}>
                  <i className="bi bi-1-circle" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2">Faça seu cadastro</p>
                </Col>
                <Col md={3}>
                  <i className="bi bi-2-circle" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2">Escolha o serviço</p>
                </Col>
                <Col md={3}>
                  <i className="bi bi-3-circle" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2">Agende sua consulta</p>
                </Col>
                <Col md={3}>
                  <i className="bi bi-4-circle" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2">Seja atendido</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;

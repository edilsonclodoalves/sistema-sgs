import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Badge, Button } from 'react-bootstrap';

const UnidadesSaude = () => {
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('todas');
  
  const unidades = [
    {
      id: 1,
      nome: 'UBS Centro',
      endereco: 'Rua Principal, 123 - Centro',
      telefone: '(11) 3333-1111',
      horario: 'Segunda a Sexta: 7h às 17h',
      especialidades: ['Clínico Geral', 'Pediatria', 'Ginecologia', 'Odontologia'],
      latitude: -23.550520,
      longitude: -46.633308,
      tipo: 'UBS'
    },
    {
      id: 2,
      nome: 'UBS Vila Nova',
      endereco: 'Av. Santos, 456 - Vila Nova',
      telefone: '(11) 3333-2222',
      horario: 'Segunda a Sexta: 7h às 17h',
      especialidades: ['Clínico Geral', 'Pediatria', 'Enfermagem'],
      latitude: -23.552520,
      longitude: -46.635308,
      tipo: 'UBS'
    },
    {
      id: 3,
      nome: 'UBS Jardim das Flores',
      endereco: 'Rua das Flores, 789 - Jardim das Flores',
      telefone: '(11) 3333-3333',
      horario: 'Segunda a Sexta: 7h às 19h',
      especialidades: ['Clínico Geral', 'Cardiologia', 'Dermatologia', 'Psicologia'],
      latitude: -23.554520,
      longitude: -46.637308,
      tipo: 'UBS'
    },
    {
      id: 4,
      nome: 'UBS Parque Industrial',
      endereco: 'Av. Industrial, 321 - Parque Industrial',
      telefone: '(11) 3333-4444',
      horario: 'Segunda a Sexta: 7h às 17h',
      especialidades: ['Clínico Geral', 'Enfermagem', 'Farmácia'],
      latitude: -23.556520,
      longitude: -46.639308,
      tipo: 'UBS'
    },
    {
      id: 5,
      nome: 'Hospital Municipal',
      endereco: 'Av. Central, 1000 - Centro',
      telefone: '(11) 3333-5555',
      horario: '24 horas',
      especialidades: ['Emergência', 'Clínico Geral', 'Cirurgia', 'Ortopedia', 'Cardiologia'],
      latitude: -23.551520,
      longitude: -46.634308,
      tipo: 'Hospital'
    }
  ];

  const especialidadesUnicas = ['todas', ...new Set(unidades.flatMap(u => u.especialidades))];

  const unidadesFiltradas = filtroEspecialidade === 'todas' 
    ? unidades 
    : unidades.filter(u => u.especialidades.includes(filtroEspecialidade));

  const abrirMapa = (unidade) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${unidade.latitude},${unidade.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h2>
                <i className="bi bi-geo-alt text-primary me-2"></i>
                Unidades de Saúde
              </h2>
              <p className="text-muted mb-0">
                Encontre a unidade de saúde mais próxima de você
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtro */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Filtrar por especialidade:</Form.Label>
            <Form.Select 
              value={filtroEspecialidade}
              onChange={(e) => setFiltroEspecialidade(e.target.value)}
            >
              {especialidadesUnicas.map((esp, index) => (
                <option key={index} value={esp}>
                  {esp === 'todas' ? 'Todas as especialidades' : esp}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Lista de Unidades */}
      <Row className="g-4">
        {unidadesFiltradas.map(unidade => (
          <Col md={6} lg={4} key={unidade.id}>
            <Card className="h-100 shadow-sm">
              <Card.Header className={`bg-${unidade.tipo === 'Hospital' ? 'danger' : 'primary'} bg-opacity-10`}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{unidade.nome}</h5>
                  <Badge bg={unidade.tipo === 'Hospital' ? 'danger' : 'primary'}>
                    {unidade.tipo}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <p className="mb-2">
                    <i className="bi bi-geo-alt text-primary me-2"></i>
                    <strong>Endereço:</strong>
                  </p>
                  <p className="text-muted ms-4">{unidade.endereco}</p>
                </div>

                <div className="mb-3">
                  <p className="mb-2">
                    <i className="bi bi-telephone text-success me-2"></i>
                    <strong>Telefone:</strong>
                  </p>
                  <p className="text-muted ms-4">{unidade.telefone}</p>
                </div>

                <div className="mb-3">
                  <p className="mb-2">
                    <i className="bi bi-clock text-info me-2"></i>
                    <strong>Horário:</strong>
                  </p>
                  <p className="text-muted ms-4">{unidade.horario}</p>
                </div>

                <div className="mb-3">
                  <p className="mb-2">
                    <i className="bi bi-heart-pulse text-danger me-2"></i>
                    <strong>Especialidades:</strong>
                  </p>
                  <div className="d-flex flex-wrap gap-1 ms-4">
                    {unidade.especialidades.map((esp, index) => (
                      <Badge key={index} bg="secondary" className="text-wrap">
                        {esp}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  className="w-100"
                  onClick={() => abrirMapa(unidade)}
                >
                  <i className="bi bi-map me-2"></i>
                  Ver no Mapa
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {unidadesFiltradas.length === 0 && (
        <Row className="mt-4">
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }}></i>
                <p className="mt-3 text-muted">
                  Nenhuma unidade encontrada com essa especialidade
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Informações Adicionais */}
      <Row className="mt-4">
        <Col>
          <Card className="border-info">
            <Card.Body>
              <h5>
                <i className="bi bi-info-circle text-info me-2"></i>
                Como escolher a unidade ideal?
              </h5>
              <ul className="mb-0">
                <li>Escolha a unidade mais próxima da sua residência</li>
                <li>Verifique se a especialidade que você precisa está disponível</li>
                <li>Em casos de emergência, dirija-se ao Hospital Municipal</li>
                <li>Entre em contato por telefone para confirmar horários e disponibilidade</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UnidadesSaude;

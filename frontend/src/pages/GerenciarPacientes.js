import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const GerenciarPacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  useEffect(() => {
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pacientes');
      setPacientes(response.data.pacientes || []);
    } catch (error) {
      toast.error('Erro ao carregar pacientes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalhes = (paciente) => {
    setPacienteSelecionado(paciente);
    setShowModal(true);
  };

  const pacientesFiltrados = pacientes.filter(p => {
    const termo = busca.toLowerCase();
    return (
      p.pessoa?.nome_completo?.toLowerCase().includes(termo) ||
      p.pessoa?.cpf?.includes(termo) ||
      p.cartao_sus?.includes(termo)
    );
  });

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="bi bi-people me-2"></i>
            Gerenciar Pacientes
          </h2>
          <p className="text-muted mb-0">
            Total: {pacientes.length} paciente(s) cadastrado(s)
          </p>
        </div>
        <Link to="/admin/pacientes/novo" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i>
          Cadastrar Paciente
        </Link>
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar por nome, CPF ou cartão SUS..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : pacientesFiltrados.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome Completo</th>
                    <th>CPF</th>
                    <th>Cartão SUS</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesFiltrados.map((paciente) => (
                    <tr key={paciente.id}>
                      <td>#{paciente.id}</td>
                      <td>{paciente.pessoa?.nome_completo || 'N/A'}</td>
                      <td>{paciente.pessoa?.cpf || 'N/A'}</td>
                      <td>{paciente.cartao_sus || 'N/A'}</td>
                      <td>{paciente.pessoa?.telefone || paciente.pessoa?.celular || 'N/A'}</td>
                      <td>
                        <Badge bg={paciente.pessoa?.ativo ? 'success' : 'danger'}>
                          {paciente.pessoa?.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleVerDetalhes(paciente)}
                            title="Ver Detalhes"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            as={Link}
                            to={`/admin/pacientes/${paciente.id}/editar`}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            as={Link}
                            to={`/admin/pacientes/${paciente.id}/historico`}
                            title="Ver Histórico"
                          >
                            <i className="bi bi-file-medical"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3">
                {busca ? 'Nenhum paciente encontrado com esse critério' : 'Nenhum paciente cadastrado'}
              </p>
              {!busca && (
                <Link to="/admin/pacientes/novo" className="btn btn-primary">
                  Cadastrar Primeiro Paciente
                </Link>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Detalhes do Paciente */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-circle me-2"></i>
            Detalhes do Paciente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pacienteSelecionado && (
            <Row>
              <Col md={6}>
                <h6 className="text-muted">Dados Pessoais</h6>
                <p><strong>Nome:</strong> {pacienteSelecionado.pessoa?.nome_completo}</p>
                <p><strong>CPF:</strong> {pacienteSelecionado.pessoa?.cpf}</p>
                <p><strong>Data de Nascimento:</strong> {
                  pacienteSelecionado.pessoa?.data_nascimento 
                    ? new Date(pacienteSelecionado.pessoa.data_nascimento).toLocaleDateString('pt-BR')
                    : 'N/A'
                }</p>
                <p><strong>Sexo:</strong> {pacienteSelecionado.pessoa?.sexo}</p>
                <p><strong>Cartão SUS:</strong> {pacienteSelecionado.cartao_sus || 'N/A'}</p>
              </Col>
              <Col md={6}>
                <h6 className="text-muted">Contato</h6>
                <p><strong>Email:</strong> {pacienteSelecionado.pessoa?.email || 'N/A'}</p>
                <p><strong>Telefone:</strong> {pacienteSelecionado.pessoa?.telefone || 'N/A'}</p>
                <p><strong>Celular:</strong> {pacienteSelecionado.pessoa?.celular || 'N/A'}</p>
                
                <h6 className="text-muted mt-3">Endereço</h6>
                <p><strong>CEP:</strong> {pacienteSelecionado.pessoa?.cep || 'N/A'}</p>
                <p><strong>Logradouro:</strong> {pacienteSelecionado.pessoa?.logradouro || 'N/A'}</p>
                <p><strong>Número:</strong> {pacienteSelecionado.pessoa?.numero || 'N/A'}</p>
                <p><strong>Bairro:</strong> {pacienteSelecionado.pessoa?.bairro || 'N/A'}</p>
                <p><strong>Cidade:</strong> {pacienteSelecionado.pessoa?.cidade || 'N/A'}</p>
                <p><strong>Estado:</strong> {pacienteSelecionado.pessoa?.estado || 'N/A'}</p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
          <Button 
            variant="primary" 
            as={Link}
            to={`/admin/pacientes/${pacienteSelecionado?.id}/editar`}
            onClick={() => setShowModal(false)}
          >
            <i className="bi bi-pencil me-2"></i>
            Editar Paciente
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GerenciarPacientes;

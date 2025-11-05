import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      // Nota: Criar endpoint /api/usuarios no backend
      const response = await api.get('/usuarios');
      setUsuarios(response.data.usuarios || []);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalhes = (usuario) => {
    setUsuarioSelecionado(usuario);
    setShowModal(true);
  };

  const handleToggleAtivo = async (usuario) => {
    try {
      await api.put(`/usuarios/${usuario.id}`, {
        ativo: !usuario.ativo
      });
      
      toast.success(`Usuário ${!usuario.ativo ? 'ativado' : 'desativado'} com sucesso!`);
      carregarUsuarios();
    } catch (error) {
      toast.error('Erro ao atualizar status do usuário');
      console.error(error);
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const termo = busca.toLowerCase();
    return (
      u.pessoa?.nome_completo?.toLowerCase().includes(termo) ||
      u.email?.toLowerCase().includes(termo) ||
      u.perfil?.toLowerCase().includes(termo)
    );
  });

  const getPerfilBadgeColor = (perfil) => {
    switch (perfil) {
      case 'ADMINISTRADOR':
        return 'danger';
      case 'GESTOR':
        return 'warning';
      case 'MEDICO':
        return 'info';
      case 'RECEPCIONISTA':
        return 'secondary';
      case 'PACIENTE':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="bi bi-person-badge me-2"></i>
            Gerenciar Usuários
          </h2>
          <p className="text-muted mb-0">
            Total: {usuarios.length} usuário(s) cadastrado(s)
          </p>
        </div>
        <Link to="/admin/usuarios/novo" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i>
          Cadastrar Usuário
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
              placeholder="Buscar por nome, email ou perfil..."
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
          ) : usuariosFiltrados.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Perfil</th>
                    <th>Último Acesso</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>#{usuario.id}</td>
                      <td>{usuario.pessoa?.nome_completo || 'N/A'}</td>
                      <td>{usuario.email}</td>
                      <td>
                        <Badge bg={getPerfilBadgeColor(usuario.perfil)}>
                          {usuario.perfil}
                        </Badge>
                      </td>
                      <td>
                        {usuario.ultimo_acesso
                          ? new Date(usuario.ultimo_acesso).toLocaleDateString('pt-BR')
                          : 'Nunca'}
                      </td>
                      <td>
                        <Badge bg={usuario.ativo ? 'success' : 'danger'}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleVerDetalhes(usuario)}
                            title="Ver Detalhes"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            as={Link}
                            to={`/admin/usuarios/${usuario.id}/editar`}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant={usuario.ativo ? 'outline-danger' : 'outline-success'}
                            size="sm"
                            onClick={() => handleToggleAtivo(usuario)}
                            title={usuario.ativo ? 'Desativar' : 'Ativar'}
                          >
                            <i className={`bi bi-${usuario.ativo ? 'x-circle' : 'check-circle'}`}></i>
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
                {busca ? 'Nenhum usuário encontrado com esse critério' : 'Nenhum usuário cadastrado'}
              </p>
              {!busca && (
                <Link to="/admin/usuarios/novo" className="btn btn-primary">
                  Cadastrar Primeiro Usuário
                </Link>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Detalhes do Usuário */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-badge me-2"></i>
            Detalhes do Usuário
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuarioSelecionado && (
            <Row>
              <Col md={6}>
                <h6 className="text-muted">Informações do Usuário</h6>
                <p><strong>ID:</strong> #{usuarioSelecionado.id}</p>
                <p><strong>Email:</strong> {usuarioSelecionado.email}</p>
                <p><strong>Perfil:</strong> 
                  <Badge bg={getPerfilBadgeColor(usuarioSelecionado.perfil)} className="ms-2">
                    {usuarioSelecionado.perfil}
                  </Badge>
                </p>
                <p><strong>Status:</strong> 
                  <Badge bg={usuarioSelecionado.ativo ? 'success' : 'danger'} className="ms-2">
                    {usuarioSelecionado.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </p>
                <p><strong>Último Acesso:</strong> {
                  usuarioSelecionado.ultimo_acesso
                    ? new Date(usuarioSelecionado.ultimo_acesso).toLocaleString('pt-BR')
                    : 'Nunca acessou'
                }</p>
              </Col>
              <Col md={6}>
                <h6 className="text-muted">Dados Pessoais</h6>
                <p><strong>Nome:</strong> {usuarioSelecionado.pessoa?.nome_completo}</p>
                <p><strong>CPF:</strong> {usuarioSelecionado.pessoa?.cpf}</p>
                <p><strong>Telefone:</strong> {usuarioSelecionado.pessoa?.telefone || 'N/A'}</p>
                <p><strong>Celular:</strong> {usuarioSelecionado.pessoa?.celular || 'N/A'}</p>
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
            to={`/admin/usuarios/${usuarioSelecionado?.id}/editar`}
            onClick={() => setShowModal(false)}
          >
            <i className="bi bi-pencil me-2"></i>
            Editar Usuário
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GerenciarUsuarios;

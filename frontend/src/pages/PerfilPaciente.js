import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const PerfilPaciente = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    celular: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // Busca os dados do próprio paciente logado
      const response = await api.get('/auth/me');
      const pessoa = response.data.usuario?.pessoa;
      
      if (pessoa) {
        setFormData({
          nome_completo: pessoa.nome_completo || '',
          email: pessoa.email || '',
          telefone: pessoa.telefone || '',
          celular: pessoa.celular || '',
          cep: pessoa.cep || '',
          logradouro: pessoa.logradouro || '',
          numero: pessoa.numero || '',
          complemento: pessoa.complemento || '',
          bairro: pessoa.bairro || '',
          cidade: pessoa.cidade || '',
          estado: pessoa.estado || ''
        });
      }
    } catch (err) {
      setError('Erro ao carregar seus dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSalvando(true);

    try {
      // Atualiza apenas os dados permitidos para pacientes
      const response = await api.put(`/pacientes/${user.id}`, formData);
      
      if (response.data) {
        setSuccess('Seus dados foram atualizados com sucesso!');
        toast.success('Perfil atualizado!');
        
        // Atualiza o contexto do usuário
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao atualizar seus dados';
      setError(message);
      toast.error(message);
    } finally {
      setSalvando(false);
    }
  };

  const buscarCEP = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    
    if (cep.length !== 8) {
      toast.error('CEP inválido');
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setFormData(prev => ({
        ...prev,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      }));

      toast.success('CEP encontrado!');
    } catch (err) {
      toast.error('Erro ao buscar CEP');
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>
          <i className="bi bi-person-circle me-2"></i>
          Meu Perfil
        </h2>
        <p className="text-muted">Atualize seus dados pessoais</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <h5 className="mb-3">
              <i className="bi bi-person me-2"></i>
              Dados Pessoais
            </h5>
            
            <Row>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Nome Completo *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome_completo"
                    value={formData.nome_completo}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mb-3 mt-4">
              <i className="bi bi-telephone me-2"></i>
              Contato
            </h5>
            
            <Row>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Telefone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(00) 0000-0000"
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Celular *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mb-3 mt-4">
              <i className="bi bi-geo-alt me-2"></i>
              Endereço
            </h5>

            <Row>
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>CEP</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    <Button
                      variant="outline-primary"
                      onClick={buscarCEP}
                      disabled={formData.cep.replace(/\D/g, '').length !== 8}
                    >
                      <i className="bi bi-search"></i>
                    </Button>
                  </div>
                </Form.Group>
              </Col>

              <Col md={7} className="mb-3">
                <Form.Group>
                  <Form.Label>Logradouro</Form.Label>
                  <Form.Control
                    type="text"
                    name="logradouro"
                    value={formData.logradouro}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={2} className="mb-3">
                <Form.Group>
                  <Form.Label>Número</Form.Label>
                  <Form.Control
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Complemento</Form.Label>
                  <Form.Control
                    type="text"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Bairro</Form.Label>
                  <Form.Control
                    type="text"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Cidade</Form.Label>
                  <Form.Control
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={1} className="mb-3">
                <Form.Group>
                  <Form.Label>UF</Form.Label>
                  <Form.Control
                    type="text"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    maxLength={2}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={salvando}
              >
                {salvando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Salvar Alterações
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline-secondary"
                onClick={carregarDados}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Cancelar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mt-4 border-info">
        <Card.Body>
          <h6 className="text-info">
            <i className="bi bi-info-circle me-2"></i>
            Informações Importantes
          </h6>
          <ul className="mb-0 small">
            <li>Mantenha seus dados de contato sempre atualizados</li>
            <li>O telefone/celular será usado para confirmação de consultas</li>
            <li>Para alterar dados como CPF ou data de nascimento, procure a recepção</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PerfilPaciente;
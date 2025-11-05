import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const CadastrarUsuario = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Dados da pessoa
    cpf: '',
    nome_completo: '',
    data_nascimento: '',
    sexo: '',
    email: '',
    telefone: '',
    celular: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    // Dados do usuário
    senha: '',
    confirmar_senha: '',
    perfil: 'RECEPCIONISTA'
  });

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

    // Validações
    if (formData.senha !== formData.confirmar_senha) {
      setError('As senhas não conferem');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Remove confirmação de senha antes de enviar
      const { confirmar_senha, ...dadosParaEnviar } = formData;
      
      await api.post('/auth/register', dadosParaEnviar);
      
      toast.success('Usuário cadastrado com sucesso!');
      navigate('/admin/usuarios');
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao cadastrar usuário';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
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

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>
          <i className="bi bi-person-plus me-2"></i>
          Cadastrar Novo Usuário
        </h2>
        <p className="text-muted">Preencha os dados para criar um novo usuário do sistema</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            {/* Dados Pessoais */}
            <h5 className="mb-3">
              <i className="bi bi-person me-2"></i>
              Dados Pessoais
            </h5>
            
            <Row>
              <Col md={8} className="mb-3">
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

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>CPF *</Form.Label>
                  <Form.Control
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Data de Nascimento *</Form.Label>
                  <Form.Control
                    type="date"
                    name="data_nascimento"
                    value={formData.data_nascimento}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Sexo *</Form.Label>
                  <Form.Select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Perfil *</Form.Label>
                  <Form.Select
                    name="perfil"
                    value={formData.perfil}
                    onChange={handleChange}
                    required
                  >
                    <option value="ADMINISTRADOR">Administrador</option>
                    <option value="GESTOR">Gestor</option>
                    <option value="MEDICO">Médico</option>
                    <option value="RECEPCIONISTA">Recepcionista</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Define as permissões do usuário no sistema
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Dados de Contato */}
            <h5 className="mb-3 mt-4">
              <i className="bi bi-telephone me-2"></i>
              Contato
            </h5>
            
            <Row>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Será usado para login no sistema
                  </Form.Text>
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

            {/* Senha */}
            <h5 className="mb-3 mt-4">
              <i className="bi bi-key me-2"></i>
              Senha de Acesso
            </h5>
            
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Senha *</Form.Label>
                  <Form.Control
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                  <Form.Text className="text-muted">
                    Mínimo de 6 caracteres
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Confirmar Senha *</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmar_senha"
                    value={formData.confirmar_senha}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Endereço */}
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Cadastrar Usuário
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/admin/usuarios')}
              >
                <i className="bi bi-x-lg me-2"></i>
                Cancelar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CadastrarUsuario;

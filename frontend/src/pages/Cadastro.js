import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Cadastro = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    email: '',
    endereco: '',
    cep: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    // Formatação específica por campo
    if (name === 'cpf') {
      formattedValue = value.replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else if (name === 'telefone') {
      formattedValue = value.replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    } else if (name === 'cep') {
      formattedValue = value.replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    const userData = {
      nome: formData.nome,
      cpf: formData.cpf.replace(/\D/g, ''),
      data_nascimento: formData.dataNascimento,
      telefone: formData.telefone.replace(/\D/g, ''),
      email: formData.email,
      endereco: formData.endereco,
      cep: formData.cep.replace(/\D/g, ''),
      senha: formData.senha
    };

    const result = await register(userData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="shadow">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <i className="bi bi-person-plus text-primary" style={{ fontSize: '3rem' }}></i>
                <h2 className="mt-3">Criar Conta</h2>
                <p className="text-muted">Preencha seus dados para cadastrar-se</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success">
                  Cadastro realizado com sucesso! Redirecionando para login...
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nome Completo *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nome"
                        placeholder="Digite seu nome completo"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>CPF *</Form.Label>
                      <Form.Control
                        type="text"
                        name="cpf"
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={handleChange}
                        maxLength={14}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Data de Nascimento *</Form.Label>
                      <Form.Control
                        type="date"
                        name="dataNascimento"
                        value={formData.dataNascimento}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Telefone *</Form.Label>
                      <Form.Control
                        type="text"
                        name="telefone"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={handleChange}
                        maxLength={15}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>E-mail *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Endereço *</Form.Label>
                      <Form.Control
                        type="text"
                        name="endereco"
                        placeholder="Rua, número, bairro"
                        value={formData.endereco}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>CEP *</Form.Label>
                      <Form.Control
                        type="text"
                        name="cep"
                        placeholder="00000-000"
                        value={formData.cep}
                        onChange={handleChange}
                        maxLength={9}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Senha *</Form.Label>
                      <Form.Control
                        type="password"
                        name="senha"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.senha}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirmar Senha *</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmarSenha"
                        placeholder="Digite a senha novamente"
                        value={formData.confirmarSenha}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Cadastrando...
                    </>
                  ) : (
                    'Cadastrar'
                  )}
                </Button>

                <div className="text-center">
                  Já possui uma conta?{' '}
                  <Link to="/login" className="text-decoration-none">
                    Fazer login
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cadastro;

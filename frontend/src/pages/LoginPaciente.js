import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPaciente = () => {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Remove formatação do CPF antes de enviar
    const loginData = { 
      cpf: cpf.replace(/\D/g, ''), 
      senha 
    };

    const result = await login(loginData);
    
    if (result.success) {
      navigate('/paciente/dashboard'); // Redireciona para área do paciente
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return cpf;
  };

  const handleCpfChange = (e) => {
    const value = e.target.value;
    setCpf(formatCPF(value));
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <i className="bi bi-person-circle text-primary" style={{ fontSize: '3rem' }}></i>
                <h2 className="mt-3">Área do Paciente</h2>
                <p className="text-muted">Entre com seu CPF e senha</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>CPF</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    required
                    maxLength={14}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Senha</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>

                <div className="text-center">
                  <Link to="/paciente/esqueci-senha" className="text-decoration-none me-3">
                    Esqueci minha senha
                  </Link>
                  <span className="text-muted">|</span>
                  <Link to="/paciente/cadastro" className="text-decoration-none ms-3">
                    Criar conta
                  </Link>
                </div>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="text-muted mb-2">Você é um profissional de saúde?</p>
                  <Link to="/admin" className="btn btn-outline-secondary w-100">
                    Acessar como Usuário do Sistema
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

export default LoginPaciente;
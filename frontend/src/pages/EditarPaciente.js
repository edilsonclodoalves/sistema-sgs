import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const EditarPaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    data_nascimento: '',
    sexo: '',
    telefone: '',
    email: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
  });

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const response = await api.get(`/pacientes/${id}`);
        console.log('📊 Resposta completa da API:', response);
        console.log('📊 response.data:', response.data);
        
        // Trata diferentes estruturas de resposta possíveis
        let dadosPaciente;
        
        if (response.data.paciente) {
          // Estrutura: { paciente: {...} }
          dadosPaciente = response.data.paciente;
        } else if (response.data.pessoa) {
          // Estrutura com pessoa aninhada: { pessoa: {...}, id, ... }
          dadosPaciente = {
            ...response.data,
            nome_completo: response.data.pessoa.nome_completo,
            cpf: response.data.pessoa.cpf,
            sexo: response.data.pessoa.sexo,
            telefone: response.data.pessoa.telefone,
            email: response.data.pessoa.email,
            cep: response.data.pessoa.cep,
            logradouro: response.data.pessoa.logradouro,
            numero: response.data.pessoa.numero,
            complemento: response.data.pessoa.complemento,
            bairro: response.data.pessoa.bairro,
            cidade: response.data.pessoa.cidade,
            estado: response.data.pessoa.estado,
          };
        } else {
          // Estrutura direta: { id, nome_completo, cpf, ... }
          dadosPaciente = response.data;
        }
        
        console.log('📊 Dados processados:', dadosPaciente);

        // Formata a data de nascimento para o formato YYYY-MM-DD
        const dataNascimentoFormatada = dadosPaciente.data_nascimento 
          ? new Date(dadosPaciente.data_nascimento).toISOString().split('T')[0] 
          : '';

        const formDataToSet = {
          nome_completo: dadosPaciente.nome_completo || '',
          cpf: dadosPaciente.cpf || '',
          data_nascimento: dataNascimentoFormatada,
          sexo: dadosPaciente.sexo || '',
          telefone: dadosPaciente.telefone || '',
          email: dadosPaciente.email || '',
          endereco: {
            cep: dadosPaciente.cep || '',
            logradouro: dadosPaciente.logradouro || '',
            numero: dadosPaciente.numero || '',
            complemento: dadosPaciente.complemento || '',
            bairro: dadosPaciente.bairro || '',
            cidade: dadosPaciente.cidade || '',
            estado: dadosPaciente.estado || '',
          },
        };
        
        console.log('📊 FormData que será setado:', formDataToSet);
        setFormData(formDataToSet);
        setLoading(false);
      } catch (err) {
        console.error('❌ Erro ao buscar paciente:', err);
        console.error('❌ Detalhes do erro:', err.response?.data);
        setError('Não foi possível carregar os dados do paciente.');
        setLoading(false);
      }
    };

    fetchPaciente();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const dataToSend = {
        nome_completo: formData.nome_completo,
        cpf: formData.cpf,
        data_nascimento: formData.data_nascimento,
        sexo: formData.sexo,
        telefone: formData.telefone,
        email: formData.email,
        endereco: formData.endereco,
      };

      await api.put(`/pacientes/${id}`, dataToSend);
      
      toast.success('Paciente atualizado com sucesso!');
      navigate('/admin/pacientes');
      
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao atualizar paciente';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-3">Carregando dados do paciente...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>
          <i className="bi bi-pencil-square me-2"></i>
          Editar Paciente
        </h2>
        <p className="text-muted">Atualize as informações cadastrais do paciente.</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            
            <h5 className="mb-3 text-primary">
              <i className="bi bi-person-vcard me-2"></i>
              Dados Pessoais
            </h5>
            <Row>
              <Col md={6} className="mb-3">
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
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>CPF *</Form.Label>
                  <Form.Control
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    required
                    maxLength={11}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="mb-3">
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
              <Col md={3} className="mb-3">
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
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Telefone *</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />

            <h5 className="mb-3 text-primary">
              <i className="bi bi-house-door me-2"></i>
              Endereço
            </h5>
            <Row>
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>CEP</Form.Label>
                  <Form.Control
                    type="text"
                    name="endereco.cep"
                    value={formData.endereco.cep || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Logradouro</Form.Label>
                  <Form.Control
                    type="text"
                    name="endereco.logradouro"
                    value={formData.endereco.logradouro || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Número</Form.Label>
                  <Form.Control
                    type="text"
                    name="endereco.numero"
                    value={formData.endereco.numero || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Complemento</Form.Label>
                  <Form.Control
                    type="text"
                    name="endereco.complemento"
                    value={formData.endereco.complemento || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Bairro</Form.Label>
                  <Form.Control
                    type="text"
                    name="endereco.bairro"
                    value={formData.endereco.bairro || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Cidade</Form.Label>
                  <Form.Control
                    type="text"
                    name="endereco.cidade"
                    value={formData.endereco.cidade || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Control
                    type="text"
                    name="endereco.estado"
                    value={formData.endereco.estado || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>
                    Salvar Alterações
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/admin/pacientes')}
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

export default EditarPaciente;
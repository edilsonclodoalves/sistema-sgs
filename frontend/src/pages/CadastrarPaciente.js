import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const CadastrarPaciente = () => {
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
    // Dados do paciente
    cartao_sus: '',
    tipo_sanguineo: '',
    alergias: '',
    medicamentos_uso: '',
    observacoes: '',
    convenio: '',
    numero_carteirinha: '',
    // Autenticação: pacientes fazem login com CPF + data_nascimento
    // Não coletamos senha aqui para evitar confusão
  });

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
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else if (name === 'celular') {
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

    // Nenhuma validação de senha: pacientes autenticam com CPF + data de nascimento

    setLoading(true);

    try {
      // Preparar dados para envio
      const plainPayload = {
        cpf: formData.cpf.replace(/\D/g, ''),
        nome_completo: formData.nome_completo,
        data_nascimento: formData.data_nascimento,
        sexo: formData.sexo,
        email: formData.email,
        telefone: formData.telefone.replace(/\D/g, ''),
        celular: formData.celular.replace(/\D/g, ''),
        cep: formData.cep.replace(/\D/g, ''),
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        cartao_sus: formData.cartao_sus || null,
        tipo_sanguineo: formData.tipo_sanguineo || null,
        alergias: formData.alergias || null,
        medicamentos_uso: formData.medicamentos_uso || null,
        observacoes: formData.observacoes || null,
        convenio: formData.convenio || null,
        numero_carteirinha: formData.numero_carteirinha || null
      };

      // Send JSON payload (no file upload)
      await api.post('/pacientes', plainPayload);
      
      toast.success('Paciente cadastrado com sucesso!');
      navigate('/admin/pacientes');
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Erro ao cadastrar paciente';
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
          Cadastrar Novo Paciente
        </h2>
        <p className="text-muted">Preencha os dados para criar um novo paciente no sistema</p>
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
                    placeholder="Digite o nome completo"
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
                  <Form.Label>Cartão SUS</Form.Label>
                  <Form.Control
                    type="text"
                    name="cartao_sus"
                    value={formData.cartao_sus}
                    onChange={handleChange}
                    placeholder="Número do cartão SUS"
                  />
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
                    placeholder="seu@email.com"
                    required
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
                    placeholder="Rua, Avenida, etc."
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
                    placeholder="123"
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
                    placeholder="Apto, sala, etc."
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

            {/* Informações de Saúde */}
            <h5 className="mb-3 mt-4">
              <i className="bi bi-heart-pulse me-2"></i>
              Informações de Saúde
            </h5>

            <Row>
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Tipo Sanguíneo</Form.Label>
                  <Form.Select
                    name="tipo_sanguineo"
                    value={formData.tipo_sanguineo}
                    onChange={handleChange}
                  >
                    <option value="">Selecione...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={9} className="mb-3">
                <Form.Group>
                  <Form.Label>Alergias</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="alergias"
                    value={formData.alergias}
                    onChange={handleChange}
                    placeholder="Descreva alergias conhecidas"
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Medicamentos em uso</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="medicamentos_uso"
                    value={formData.medicamentos_uso}
                    onChange={handleChange}
                    placeholder="Lista de medicamentos ou remédios contínuos"
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Observações</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    placeholder="Observações clínicas relevantes"
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Convênio</Form.Label>
                  <Form.Control
                    type="text"
                    name="convenio"
                    value={formData.convenio}
                    onChange={handleChange}
                    placeholder="Nome do convênio (se houver)"
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Nº Carteirinha</Form.Label>
                  <Form.Control
                    type="text"
                    name="numero_carteirinha"
                    value={formData.numero_carteirinha}
                    onChange={handleChange}
                    placeholder="Número da carteirinha"
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Cartão SUS</Form.Label>
                  <Form.Control
                    type="text"
                    name="cartao_sus"
                    value={formData.cartao_sus}
                    onChange={handleChange}
                    placeholder="Número do cartão SUS"
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mb-3 mt-4 text-muted">
              Os pacientes fazem login usando CPF e Data de Nascimento (formato YYYY-MM-DD).
              Não é necessário definir uma senha aqui; a senha inicial será a data de nascimento.
            </h6>

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
                    Cadastrar Paciente
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

export default CadastrarPaciente;

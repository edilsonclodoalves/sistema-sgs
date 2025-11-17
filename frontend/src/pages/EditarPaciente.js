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
    // Dados da pessoa
    nome_completo: '',
    cpf: '',
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
    numero_carteirinha: ''
  });
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const response = await api.get(`/pacientes/${id}`);
        console.log('📊 Resposta completa da API:', response);
        console.log('📊 response.data:', response.data);
        
        // Normalize response and extract pessoa + paciente fields
        const payload = response.data.paciente ? response.data.paciente : response.data;
        const pessoa = payload.pessoa || response.data.pessoa || {};

        const dataNascimentoFormatada = (pessoa.data_nascimento || payload.data_nascimento)
          ? new Date(pessoa.data_nascimento || payload.data_nascimento).toISOString().split('T')[0]
          : '';

        const formDataToSet = {
          nome_completo: pessoa.nome_completo || payload.nome_completo || '',
          cpf: pessoa.cpf || payload.cpf || '',
          data_nascimento: dataNascimentoFormatada,
          sexo: pessoa.sexo || payload.sexo || '',
          telefone: pessoa.telefone || pessoa.celular || payload.telefone || '',
          email: pessoa.email || payload.email || '',
          celular: pessoa.celular || payload.celular || '',
          cep: pessoa.cep || payload.cep || '',
          logradouro: pessoa.logradouro || payload.logradouro || '',
          numero: pessoa.numero || payload.numero || '',
          complemento: pessoa.complemento || payload.complemento || '',
          bairro: pessoa.bairro || payload.bairro || '',
          cidade: pessoa.cidade || payload.cidade || '',
          estado: pessoa.estado || payload.estado || '',
          cartao_sus: payload.cartao_sus || '',
          tipo_sanguineo: payload.tipo_sanguineo || '',
          alergias: payload.alergias || '',
          medicamentos_uso: payload.medicamentos_uso || '',
          observacoes: payload.observacoes || '',
          convenio: payload.convenio || '',
          numero_carteirinha: payload.numero_carteirinha || ''
        };

        setFormData(formDataToSet);
        setOriginalData(formDataToSet);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!originalData) {
        throw new Error('Dados originais não carregados');
      }

      // Campos pertencentes à Pessoa vs Paciente
      const pessoaFields = [
        'cpf','nome_completo','data_nascimento','sexo','email','telefone','celular','cep','logradouro','numero','complemento','bairro','cidade','estado'
      ];
      const pacienteFields = [
        'cartao_sus','tipo_sanguineo','alergias','medicamentos_uso','observacoes','convenio','numero_carteirinha'
      ];

      const payload = {};
      const pessoaPayload = {};
      const pacientePayload = {};

      // compare pessoa fields
      pessoaFields.forEach(field => {
        const current = (field === 'cpf') ? formData[field].replace(/\D/g, '') : formData[field];
        const original = (originalData[field] === undefined || originalData[field] === null) ? '' : originalData[field];
        const origNormalized = (field === 'cpf') ? (original + '') : original;
        if ((current || '') !== (origNormalized || '')) {
          pessoaPayload[field] = current || null;
        }
      });

      // compare paciente fields
      pacienteFields.forEach(field => {
        const current = formData[field];
        const original = originalData[field];
        if ((current || '') !== (original || '')) {
          pacientePayload[field] = current === '' ? null : current;
        }
      });

      if (Object.keys(pessoaPayload).length > 0) {
        payload.pessoa = pessoaPayload;
      }
      if (Object.keys(pacientePayload).length > 0) {
        Object.assign(payload, pacientePayload);
      }

      if (Object.keys(payload).length === 0) {
        toast.info('Nenhuma alteração detectada');
        setSubmitting(false);
        return;
      }

      await api.put(`/pacientes/${id}`, payload);
      
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
                    readOnly
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
                    readOnly
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
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Celular *</Form.Label>
                  <Form.Control
                    type="text"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    required
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
                    name="cep"
                    value={formData.cep || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Logradouro</Form.Label>
                  <Form.Control
                    type="text"
                    name="logradouro"
                    value={formData.logradouro || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Número</Form.Label>
                  <Form.Control
                    type="text"
                    name="numero"
                    value={formData.numero || ''}
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
                    value={formData.complemento || ''}
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
                    value={formData.bairro || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Cidade</Form.Label>
                  <Form.Control
                    type="text"
                    name="cidade"
                    value={formData.cidade || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Control
                    type="text"
                    name="estado"
                    value={formData.estado || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

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
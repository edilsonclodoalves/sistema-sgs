import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const AgendarConsultaPaciente = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [loadingMedicos, setLoadingMedicos] = useState(true);
  const [error, setError] = useState('');
  
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  
  const [formData, setFormData] = useState({
    medico_id: '',
    especialidade: '',
    data: '',
    horario: '',
    observacoes: ''
  });

  useEffect(() => {
    carregarMedicos();
  }, []);

  const carregarMedicos = async () => {
    try {
      setLoadingMedicos(true);
      const response = await api.get('/medicos');
      
      // Verifica se a resposta é um array
      const medicosData = Array.isArray(response.data) 
        ? response.data 
        : response.data.medicos || [];
      
      setMedicos(medicosData);
      
      // Extrair especialidades únicas
      const especialidadesUnicas = [...new Set(medicosData.map(m => m.especialidade))];
      setEspecialidades(especialidadesUnicas);
      
    } catch (err) {
      console.error('Erro ao carregar médicos:', err);
      setError('Não foi possível carregar a lista de médicos. Tente novamente mais tarde.');
      setMedicos([]);
      setEspecialidades([]);
    } finally {
      setLoadingMedicos(false);
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
    setLoading(true);

    try {
      // Combinar data e horário
      const dataHora = `${formData.data}T${formData.horario}:00`;
      
      const dadosConsulta = {
        medico_id: parseInt(formData.medico_id),
        data_hora: dataHora,
        tipo_consulta: formData.especialidade,
        observacoes: formData.observacoes
      };

      await api.post('/consultas', dadosConsulta);
      
      toast.success('Consulta agendada com sucesso!');
      navigate('/paciente/consultas');
      
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao agendar consulta';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar médicos por especialidade
  const medicosFiltrados = formData.especialidade
    ? medicos.filter(m => m.especialidade === formData.especialidade)
    : medicos;

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>
          <i className="bi bi-calendar-plus me-2"></i>
          Agendar Consulta
        </h2>
        <p className="text-muted">Agende sua consulta médica</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              {loadingMedicos ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                  <p className="mt-3">Carregando médicos disponíveis...</p>
                </div>
              ) : medicos.length === 0 ? (
                <Alert variant="warning">
                  <Alert.Heading>Atenção</Alert.Heading>
                  <p>
                    Não há médicos cadastrados no sistema no momento. 
                    Entre em contato com a recepção para agendar sua consulta.
                  </p>
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <h5 className="mb-3">
                    <i className="bi bi-person-badge me-2"></i>
                    Dados do Paciente
                  </h5>
                  
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>Nome Completo</Form.Label>
                        <Form.Control
                          type="text"
                          value={user?.pessoa?.nome_completo || ''}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <h5 className="mb-3">
                    <i className="bi bi-calendar-event me-2"></i>
                    Dados da Consulta
                  </h5>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Especialidade *</Form.Label>
                        <Form.Select
                          name="especialidade"
                          value={formData.especialidade}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Selecione uma especialidade...</option>
                          {especialidades.map((esp, index) => (
                            <option key={index} value={esp}>
                              {esp}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Médico *</Form.Label>
                        <Form.Select
                          name="medico_id"
                          value={formData.medico_id}
                          onChange={handleChange}
                          required
                          disabled={!formData.especialidade}
                        >
                          <option value="">
                            {formData.especialidade 
                              ? 'Selecione um médico...' 
                              : 'Selecione a especialidade primeiro'}
                          </option>
                          {medicosFiltrados.map((medico) => (
                            <option key={medico.id} value={medico.id}>
                              {medico.pessoa?.nome_completo || medico.nome || 'Médico'}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Data *</Form.Label>
                        <Form.Control
                          type="date"
                          name="data"
                          value={formData.data}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Horário *</Form.Label>
                        <Form.Control
                          type="time"
                          name="horario"
                          value={formData.horario}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>Observações</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="observacoes"
                          value={formData.observacoes}
                          onChange={handleChange}
                          placeholder="Descreva brevemente o motivo da consulta ou informações importantes..."
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
                          Agendando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Agendar Consulta
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => navigate('/paciente/dashboard')}
                    >
                      <i className="bi bi-x-lg me-2"></i>
                      Cancelar
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-info">
            <Card.Body>
              <h6 className="text-info">
                <i className="bi bi-info-circle me-2"></i>
                Informações Importantes
              </h6>
              <ul className="small mb-0">
                <li>Chegue com 15 minutos de antecedência</li>
                <li>Traga seus documentos e cartão do SUS</li>
                <li>Se necessário, cancele com antecedência</li>
                <li>Consultas de emergência devem ser feitas no PA</li>
              </ul>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-3">
            <Card.Body>
              <h6>
                <i className="bi bi-telephone me-2"></i>
                Precisa de Ajuda?
              </h6>
              <p className="small text-muted mb-2">
                Entre em contato com a recepção:
              </p>
              <p className="small mb-0">
                <strong>Telefone:</strong> 0800 123 4567<br />
                <strong>WhatsApp:</strong> (00) 00000-0000
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AgendarConsultaPaciente;

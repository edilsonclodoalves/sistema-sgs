import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const AgendarConsultaAdmin = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  
  const [formData, setFormData] = useState({
    paciente_id: '',
    medico_id: '',
    especialidade: '',
    data: '',
    horario: '',
    observacoes: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoadingData(true);
      
      // Carregar Médicos
      const medicosResponse = await api.get('/medicos');
      const medicosData = Array.isArray(medicosResponse.data) 
        ? medicosResponse.data 
        : medicosResponse.data.medicos || [];
      setMedicos(medicosData);
      
      // Extrair especialidades únicas
      const especialidadesUnicas = [...new Set(medicosData.map(m => m.especialidade))];
      setEspecialidades(especialidadesUnicas);

      // Carregar Pacientes
      const pacientesResponse = await api.get('/pacientes');
      const pacientesData = Array.isArray(pacientesResponse.data) 
        ? pacientesResponse.data 
        : pacientesResponse.data.pacientes || [];
      setPacientes(pacientesData);
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível carregar a lista de médicos e pacientes.');
      setMedicos([]);
      setPacientes([]);
      setEspecialidades([]);
    } finally {
      setLoadingData(false);
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
        paciente_id: parseInt(formData.paciente_id),
        medico_id: parseInt(formData.medico_id),
        data_hora: dataHora,
        tipo_consulta: formData.especialidade,
        observacoes: formData.observacoes
      };

      await api.post('/consultas', dadosConsulta);
      
      toast.success('Consulta agendada com sucesso!');
      navigate('/admin/consultas');
      
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

  if (loadingData) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-3">Carregando dados necessários...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>
          <i className="bi bi-calendar-plus me-2"></i>
          Agendar Consulta (Admin)
        </h2>
        <p className="text-muted">Agende uma consulta para um paciente.</p>
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
              {pacientes.length === 0 || medicos.length === 0 ? (
                <Alert variant="warning">
                  <Alert.Heading>Atenção</Alert.Heading>
                  <p>
                    Não há pacientes ou médicos cadastrados no sistema. 
                    É necessário cadastrar ambos para agendar uma consulta.
                  </p>
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <h5 className="mb-3">
                    <i className="bi bi-person-vcard me-2"></i>
                    Dados do Paciente
                  </h5>
                  
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>Paciente *</Form.Label>
                        <Form.Select
                          name="paciente_id"
                          value={formData.paciente_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Selecione um paciente...</option>
                          {pacientes.map((paciente) => (
                            <option key={paciente.id} value={paciente.id}>
                              {paciente.pessoa?.nome_completo || `Paciente ID: ${paciente.id}`} - CPF: {paciente.pessoa?.cpf}
                            </option>
                          ))}
                        </Form.Select>
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
                      onClick={() => navigate('/admin/dashboard')}
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
                <li>Verifique a disponibilidade do médico antes de agendar.</li>
                <li>Confirme os dados do paciente antes de finalizar.</li>
                <li>O agendamento é feito em nome da clínica/unidade.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AgendarConsultaAdmin;

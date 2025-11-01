import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import consultaService from '../services/consultaService';

const AgendarConsulta = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [medicos, setMedicos] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  
  const [formData, setFormData] = useState({
    tipoConsulta: '',
    especialidade: '',
    medicoId: '',
    unidadeSaude: '',
    data: '',
    horario: '',
    observacoes: ''
  });

  const especialidades = [
    'Clínico Geral',
    'Cardiologia',
    'Dermatologia',
    'Endocrinologia',
    'Ginecologia',
    'Neurologia',
    'Oftalmologia',
    'Ortopedia',
    'Otorrinolaringologia',
    'Pediatria',
    'Psiquiatria',
    'Urologia'
  ];

  const unidades = [
    'UBS Centro',
    'UBS Vila Nova',
    'UBS Jardim das Flores',
    'UBS Parque Industrial',
    'Hospital Municipal'
  ];

  useEffect(() => {
    carregarMedicos();
  }, []);

  useEffect(() => {
    if (formData.medicoId && formData.data) {
      carregarHorariosDisponiveis();
    }
  }, [formData.medicoId, formData.data]);

  const carregarMedicos = async () => {
    try {
      const response = await consultaService.listarMedicos();
      setMedicos(response);
    } catch (error) {
      toast.error('Erro ao carregar médicos');
    }
  };

  const carregarHorariosDisponiveis = async () => {
    try {
      setLoading(true);
      const response = await consultaService.listarHorariosDisponiveis(
        formData.medicoId,
        formData.data
      );
      setHorariosDisponiveis(response);
    } catch (error) {
      toast.error('Erro ao carregar horários disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const dados = {
        medico_id: formData.medicoId,
        data: formData.data,
        horario: formData.horario,
        tipo: formData.tipoConsulta,
        especialidade: formData.especialidade,
        unidade: formData.unidadeSaude,
        observacoes: formData.observacoes,
        status: 'agendada'
      };

      await consultaService.agendarConsulta(dados);
      
      toast.success('Consulta agendada com sucesso!');
      
      // Resetar formulário
      setFormData({
        tipoConsulta: '',
        especialidade: '',
        medicoId: '',
        unidadeSaude: '',
        data: '',
        horario: '',
        observacoes: ''
      });
      setStep(1);
      
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao agendar consulta');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.tipoConsulta || !formData.especialidade)) {
      toast.warning('Preencha todos os campos obrigatórios');
      return;
    }
    if (step === 2 && (!formData.unidadeSaude || !formData.medicoId)) {
      toast.warning('Selecione a unidade e o médico');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const medicosFiltrados = medicos.filter(m => 
    m.especialidade === formData.especialidade
  );

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-calendar-plus me-2"></i>
                Agendar Consulta Médica
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              {/* Progress Steps */}
              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <div className={`text-center ${step >= 1 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 1 ? 'bg-primary text-white' : 'bg-light'}`} style={{ width: '40px', height: '40px' }}>
                      1
                    </div>
                    <div className="small mt-1">Tipo de Consulta</div>
                  </div>
                  <div className={`text-center ${step >= 2 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 2 ? 'bg-primary text-white' : 'bg-light'}`} style={{ width: '40px', height: '40px' }}>
                      2
                    </div>
                    <div className="small mt-1">Unidade e Médico</div>
                  </div>
                  <div className={`text-center ${step >= 3 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 3 ? 'bg-primary text-white' : 'bg-light'}`} style={{ width: '40px', height: '40px' }}>
                      3
                    </div>
                    <div className="small mt-1">Data e Horário</div>
                  </div>
                  <div className={`text-center ${step >= 4 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 4 ? 'bg-primary text-white' : 'bg-light'}`} style={{ width: '40px', height: '40px' }}>
                      4
                    </div>
                    <div className="small mt-1">Confirmação</div>
                  </div>
                </div>
              </div>

              <Form onSubmit={handleSubmit}>
                {/* Step 1: Tipo de Consulta */}
                {step === 1 && (
                  <div>
                    <h5 className="mb-3">Selecione o tipo de consulta</h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Consulta *</Form.Label>
                      <Form.Select
                        name="tipoConsulta"
                        value={formData.tipoConsulta}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecione...</option>
                        <option value="primeira_consulta">Primeira Consulta</option>
                        <option value="retorno">Retorno</option>
                        <option value="emergencia">Emergência</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Especialidade *</Form.Label>
                      <Form.Select
                        name="especialidade"
                        value={formData.especialidade}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecione...</option>
                        {especialidades.map((esp, index) => (
                          <option key={index} value={esp}>{esp}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                      <Button variant="primary" onClick={nextStep}>
                        Próximo <i className="bi bi-arrow-right ms-2"></i>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Unidade e Médico */}
                {step === 2 && (
                  <div>
                    <h5 className="mb-3">Escolha a unidade de saúde e o médico</h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Unidade de Saúde *</Form.Label>
                      <Form.Select
                        name="unidadeSaude"
                        value={formData.unidadeSaude}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecione...</option>
                        {unidades.map((unidade, index) => (
                          <option key={index} value={unidade}>{unidade}</option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Escolha uma unidade próxima à sua localização
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Médico *</Form.Label>
                      <Form.Select
                        name="medicoId"
                        value={formData.medicoId}
                        onChange={handleChange}
                        required
                        disabled={!formData.especialidade}
                      >
                        <option value="">Selecione...</option>
                        {medicosFiltrados.map((medico) => (
                          <option key={medico.id} value={medico.id}>
                            Dr(a). {medico.nome} - {medico.especialidade}
                          </option>
                        ))}
                      </Form.Select>
                      {medicosFiltrados.length === 0 && formData.especialidade && (
                        <Form.Text className="text-warning">
                          Nenhum médico disponível para esta especialidade
                        </Form.Text>
                      )}
                    </Form.Group>

                    <div className="d-flex justify-content-between">
                      <Button variant="secondary" onClick={prevStep}>
                        <i className="bi bi-arrow-left me-2"></i> Voltar
                      </Button>
                      <Button variant="primary" onClick={nextStep}>
                        Próximo <i className="bi bi-arrow-right ms-2"></i>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Data e Horário */}
                {step === 3 && (
                  <div>
                    <h5 className="mb-3">Selecione data e horário</h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Data *</Form.Label>
                      <Form.Control
                        type="date"
                        name="data"
                        value={formData.data}
                        onChange={handleChange}
                        min={getMinDate()}
                        max={getMaxDate()}
                        required
                      />
                      <Form.Text className="text-muted">
                        Horários disponíveis nos próximos 30 dias
                      </Form.Text>
                    </Form.Group>

                    {formData.data && (
                      <Form.Group className="mb-4">
                        <Form.Label>Horário Disponível *</Form.Label>
                        {loading ? (
                          <div className="text-center py-3">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Carregando...</span>
                            </div>
                          </div>
                        ) : horariosDisponiveis.length > 0 ? (
                          <div className="d-flex flex-wrap gap-2">
                            {horariosDisponiveis.map((horario, index) => (
                              <Button
                                key={index}
                                variant={formData.horario === horario ? 'primary' : 'outline-primary'}
                                onClick={() => setFormData(prev => ({ ...prev, horario }))}
                              >
                                {horario}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <Alert variant="warning">
                            Nenhum horário disponível para esta data. Tente outra data.
                          </Alert>
                        )}
                      </Form.Group>
                    )}

                    <Form.Group className="mb-4">
                      <Form.Label>Observações</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="observacoes"
                        placeholder="Informações adicionais sobre sua consulta (opcional)"
                        value={formData.observacoes}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-between">
                      <Button variant="secondary" onClick={prevStep}>
                        <i className="bi bi-arrow-left me-2"></i> Voltar
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={nextStep}
                        disabled={!formData.horario}
                      >
                        Próximo <i className="bi bi-arrow-right ms-2"></i>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Confirmação */}
                {step === 4 && (
                  <div>
                    <h5 className="mb-3">Confirme os dados da consulta</h5>
                    
                    <Card className="mb-4 bg-light">
                      <Card.Body>
                        <Row>
                          <Col md={6} className="mb-3">
                            <strong>Tipo de Consulta:</strong>
                            <div className="text-capitalize">{formData.tipoConsulta.replace('_', ' ')}</div>
                          </Col>
                          <Col md={6} className="mb-3">
                            <strong>Especialidade:</strong>
                            <div>{formData.especialidade}</div>
                          </Col>
                          <Col md={6} className="mb-3">
                            <strong>Unidade de Saúde:</strong>
                            <div>{formData.unidadeSaude}</div>
                          </Col>
                          <Col md={6} className="mb-3">
                            <strong>Médico:</strong>
                            <div>
                              {medicos.find(m => m.id.toString() === formData.medicoId)?.nome || 'N/A'}
                            </div>
                          </Col>
                          <Col md={6} className="mb-3">
                            <strong>Data:</strong>
                            <div>{new Date(formData.data + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                          </Col>
                          <Col md={6} className="mb-3">
                            <strong>Horário:</strong>
                            <div><Badge bg="primary">{formData.horario}</Badge></div>
                          </Col>
                          {formData.observacoes && (
                            <Col md={12}>
                              <strong>Observações:</strong>
                              <div>{formData.observacoes}</div>
                            </Col>
                          )}
                        </Row>
                      </Card.Body>
                    </Card>

                    <Alert variant="info">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Importante:</strong> Você receberá uma confirmação por SMS e e-mail. 
                      Chegue com 15 minutos de antecedência à consulta.
                    </Alert>

                    <div className="d-flex justify-content-between">
                      <Button variant="secondary" onClick={prevStep}>
                        <i className="bi bi-arrow-left me-2"></i> Voltar
                      </Button>
                      <Button 
                        variant="success" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Agendando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Confirmar Agendamento
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AgendarConsulta;

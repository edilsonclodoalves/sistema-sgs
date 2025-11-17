import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const EditarConsulta = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [consultation, setConsultation] = useState(null);
  const [formData, setFormData] = useState({
    paciente_id: '',
    medico_id: '',
    data: '',
    horario: '',
    duracao_minutos: '',
    tipo_consulta: '',
    status: '',
    observacoes: '',
    valor: '',
    motivo_cancelamento: ''
  });

  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    carregar();
  }, [id]);

  const carregar = async () => {
    try {
      setLoading(true);
      const [respConsulta, respMedicos, respPacientes] = await Promise.all([
        api.get(`/consultas/${id}`),
        api.get('/medicos'),
        api.get('/pacientes')
      ]);

      const c = respConsulta.data;
      setConsultation(c);

      // preencher form
      const dataHora = c.data_hora ? new Date(c.data_hora) : null;
      const dataIso = dataHora ? dataHora.toISOString().split('T')[0] : '';
      const horario = dataHora ? dataHora.toTimeString().slice(0,5) : '';

      setFormData({
        paciente_id: c.paciente_id || c.paciente?.id || '',
        medico_id: c.medico_id || c.medico?.id || '',
        data: dataIso,
        horario: horario,
        duracao_minutos: c.duracao_minutos || '',
        tipo_consulta: c.tipo || c.tipo_consulta || '',
        status: c.status || '',
        observacoes: c.observacoes || '',
        valor: c.valor || '',
        motivo_cancelamento: c.motivo_cancelamento || ''
      });

      const medicosData = Array.isArray(respMedicos.data) ? respMedicos.data : respMedicos.data.medicos || [];
      const pacientesData = Array.isArray(respPacientes.data) ? respPacientes.data : respPacientes.data.pacientes || [];

      setMedicos(medicosData);
      setPacientes(pacientesData);

    } catch (err) {
      console.error('Erro ao carregar consulta:', err);
      toast.error('Erro ao carregar dados da consulta');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // montar data_hora
      const dataHora = formData.data && formData.horario ? `${formData.data}T${formData.horario}:00` : null;

      const payload = {
        paciente_id: formData.paciente_id ? parseInt(formData.paciente_id) : undefined,
        medico_id: formData.medico_id ? parseInt(formData.medico_id) : undefined,
        data_hora: dataHora,
        duracao_minutos: formData.duracao_minutos ? parseInt(formData.duracao_minutos) : undefined,
        tipo: formData.tipo_consulta,
        status: formData.status,
        observacoes: formData.observacoes,
        valor: formData.valor || undefined,
        motivo_cancelamento: formData.motivo_cancelamento || undefined
      };

      // remover undefined
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      await api.put(`/consultas/${id}`, payload);
      toast.success('Consulta atualizada com sucesso');
      navigate('/admin/consultas');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao atualizar consulta');
    } finally {
      setSaving(false);
    }
  };

  const handleRealizar = async () => {
    try {
      const payload = {
        status: 'REALIZADA',
        observacoes: formData.observacoes,
        valor: formData.valor || undefined,
        duracao_minutos: formData.duracao_minutos ? parseInt(formData.duracao_minutos) : undefined
      };
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      await api.put(`/consultas/${id}`, payload);
      toast.success('Consulta marcada como REALIZADA');
      navigate('/admin/consultas');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao realizar consulta');
    }
  };

  const handleCancelar = async () => {
    try {
      await api.put(`/consultas/${id}/cancelar`, { motivo_cancelamento: formData.motivo_cancelamento });
      toast.success('Consulta cancelada com sucesso');
      setShowCancelModal(false);
      navigate('/admin/consultas');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao cancelar consulta');
    }
  };

  if (loading) return (
    <Container className="py-4 text-center">
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Carregando...</span></div>
      <p className="mt-3">Carregando consulta...</p>
    </Container>
  );

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2><i className="bi bi-pencil-square me-2"></i>Editar Consulta</h2>
        <p className="text-muted">Editar dados da consulta e registrar realização/cancelamento.</p>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSave}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Paciente</Form.Label>
                  <Form.Select name="paciente_id" value={formData.paciente_id} onChange={handleChange} required>
                    <option value="">Selecione...</option>
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>{p.pessoa?.nome_completo || `Paciente ${p.id}`}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Médico</Form.Label>
                  <Form.Select name="medico_id" value={formData.medico_id} onChange={handleChange} required>
                    <option value="">Selecione...</option>
                    {medicos.map(m => (
                      <option key={m.id} value={m.id}>{m.pessoa?.nome_completo || `Médico ${m.id}`}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Data</Form.Label>
                  <Form.Control type="date" name="data" value={formData.data} onChange={handleChange} required />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Horário</Form.Label>
                  <Form.Control type="time" name="horario" value={formData.horario} onChange={handleChange} required />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Duração (min)</Form.Label>
                  <Form.Control type="number" name="duracao_minutos" value={formData.duracao_minutos} onChange={handleChange} />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select name="tipo_consulta" value={formData.tipo_consulta} onChange={handleChange}>
                    <option value="CONSULTA">CONSULTA</option>
                    <option value="RETORNO">RETORNO</option>
                    <option value="EXAME">EXAME</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={formData.status} onChange={handleChange}>
                    <option value="AGENDADA">AGENDADA</option>
                    <option value="REALIZADA">REALIZADA</option>
                    <option value="CANCELADA">CANCELADA</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Valor</Form.Label>
                  <Form.Control type="text" name="valor" value={formData.valor} onChange={handleChange} />
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Observações</Form.Label>
                  <Form.Control as="textarea" rows={3} name="observacoes" value={formData.observacoes} onChange={handleChange} />
                </Form.Group>
              </Col>

            </Row>

            <div className="d-flex gap-2 mt-3">
              <Button variant="primary" type="submit" disabled={saving}>
                Salvar Alterações
              </Button>

              <Button variant="success" onClick={handleRealizar}>
                Marcar como REALIZADA
              </Button>

              <Button variant="danger" onClick={() => setShowCancelModal(true)}>
                Cancelar Consulta
              </Button>

              <Button variant="outline-secondary" onClick={() => navigate('/admin/consultas')}>
                Voltar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Cancelamento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Motivo do cancelamento</Form.Label>
            <Form.Control as="textarea" rows={3} value={formData.motivo_cancelamento} onChange={(e) => setFormData(prev => ({ ...prev, motivo_cancelamento: e.target.value }))} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Fechar</Button>
          <Button variant="danger" onClick={handleCancelar}>Confirmar Cancelamento</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditarConsulta;

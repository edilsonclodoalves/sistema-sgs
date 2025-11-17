import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Alert, Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const GerenciarConsultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [medicos, setMedicos] = useState([]);
  const { user, isAdmin, isMedico, getMedicoId } = useAuth();

  useEffect(() => {
    fetchConsultas();
    fetchMedicos();
  }, []);

  const fetchMedicos = async () => {
    try {
      const response = await api.get('/medicos');
      // API returns { medicos, pagination }
      setMedicos(response.data?.medicos || []);
    } catch (err) {
      console.error('Erro ao carregar médicos:', err);
    }
  };

  const fetchConsultas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/consultas');
      // O backend retorna todas as consultas, vamos filtrar no frontend por enquanto
      // API returns { consultas, pagination }
      setConsultas(response.data?.consultas || []);
    } catch (err) {
      console.error('Erro ao carregar consultas:', err);
      setError('Não foi possível carregar a lista de consultas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarConsulta = async (id) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      return;
    }

    try {
      await api.put(`/consultas/${id}/cancelar`);
      toast.success('Consulta cancelada com sucesso!');
      fetchConsultas(); // Recarrega a lista
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao cancelar consulta';
      toast.error(message);
    }
  };

  const handleRealizarConsulta = async (id) => {
    if (!window.confirm('Confirma marcar esta consulta como realizada?')) return;

    try {
      await api.put(`/consultas/${id}`, { status: 'REALIZADA' });
      toast.success('Consulta marcada como realizada!');
      fetchConsultas();
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao atualizar consulta';
      toast.error(message);
    }
  };

  const handleFiltroStatusChange = (e) => {
    setFiltroStatus(e.target.value);
  };

  const handleFiltroMedicoChange = (e) => {
    setFiltroMedico(e.target.value);
  };

  const consultasFiltradas = consultas.filter(consulta => {
    const statusMatch = filtroStatus ? consulta.status === filtroStatus : true;
    const medicoMatch = filtroMedico ? consulta.medico_id === parseInt(filtroMedico) : true;
    return statusMatch && medicoMatch;
  });

  const getStatusVariant = (status) => {
    switch (status) {
      case 'AGENDADA':
        return 'info';
      case 'REALIZADA':
        return 'success';
      case 'CANCELADA':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>
          <i className="bi bi-calendar-check me-2"></i>
          Gerenciar Consultas
        </h2>
        <p className="text-muted">Visualização e gerenciamento de todas as consultas agendadas.</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="mb-3">Filtros</Card.Title>
          <Form>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={filtroStatus} onChange={handleFiltroStatusChange}>
                    <option value="">Todos</option>
                    <option value="AGENDADA">Agendada</option>
                    <option value="REALIZADA">Realizada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Médico</Form.Label>
                  <Form.Select value={filtroMedico} onChange={handleFiltroMedicoChange}>
                    <option value="">Todos</option>
                    {medicos.map(medico => (
                      <option key={medico.id} value={medico.id}>
                        {medico.pessoa?.nome_completo || `Médico ID: ${medico.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-3">Carregando consultas...</p>
            </div>
          ) : consultasFiltradas.length === 0 ? (
            <Alert variant="info" className="m-3">
              Nenhuma consulta encontrada com os filtros aplicados.
            </Alert>
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Data/Hora</th>
                  <th>Especialidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {consultasFiltradas.map((consulta) => (
                  <tr key={consulta.id}>
                    <td>{consulta.id}</td>
                    <td>{consulta.paciente?.pessoa?.nome_completo || 'N/A'}</td>
                    <td>{consulta.medico?.pessoa?.nome_completo || 'N/A'}</td>
                    <td>{formatDateTime(consulta.data_hora)}</td>
                    <td>{consulta.medico?.especialidade || consulta.tipo_consulta || 'N/A'}</td>
                    <td>
                      <span className={`badge bg-${getStatusVariant(consulta.status)}`}>
                        {consulta.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          as={"a"}
                          href={`/admin/consultas/${consulta.id}`}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        {consulta.status === 'AGENDADA' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancelarConsulta(consulta.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          as={Link}
                          to={`/admin/consultas/${consulta.id}`}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>

                        {consulta.status === 'AGENDADA' && (isAdmin() || (isMedico() && getMedicoId() === consulta.medico_id)) && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleRealizarConsulta(consulta.id)}
                            >
                              Realizar
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancelarConsulta(consulta.id)}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GerenciarConsultas;

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Tabs, Tab, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const HistoricoMedico = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [consultas, setConsultas] = useState([]);
  const [prescricoes, setPrescricoes] = useState([]);
  const [exames, setExames] = useState([]);

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      setError('');

      // Carregar consultas
      try {
        const consultasRes = await api.get('/consultas/minhas');
        const consultasData = Array.isArray(consultasRes.data)
          ? consultasRes.data
          : consultasRes.data.consultas || [];
        
        // Filtrar apenas consultas realizadas
        const consultasRealizadas = consultasData.filter(c => c.status === 'REALIZADA');
        setConsultas(consultasRealizadas);
      } catch (err) {
        console.error('Erro ao carregar consultas:', err);
        setConsultas([]);
      }

      // Carregar prescrições (se o endpoint existir)
      try {
        const prescricoesRes = await api.get(`/prescricoes/paciente/${user.id}`);
        const prescricoesData = Array.isArray(prescricoesRes.data)
          ? prescricoesRes.data
          : prescricoesRes.data.prescricoes || [];
        setPrescricoes(prescricoesData);
      } catch (err) {
        console.error('Endpoint de prescrições não disponível:', err);
        setPrescricoes([]);
      }

      // Carregar exames (se o endpoint existir)
      try {
        const examesRes = await api.get(`/exames/paciente/${user.id}`);
        const examesData = Array.isArray(examesRes.data)
          ? examesRes.data
          : examesRes.data.exames || [];
        setExames(examesData);
      } catch (err) {
        console.error('Endpoint de exames não disponível:', err);
        setExames([]);
      }

    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setError('Erro ao carregar histórico médico');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (dataHora) => {
    if (!dataHora) return 'N/A';
    const date = new Date(dataHora);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3">Carregando seu histórico médico...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>
          <i className="bi bi-file-medical me-2"></i>
          Histórico Médico
        </h2>
        <p className="text-muted">Visualize seu histórico completo de atendimentos</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <i className="bi bi-calendar-check text-primary" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-0">{consultas.length}</h3>
              <p className="text-muted mb-0">Consultas Realizadas</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <i className="bi bi-capsule text-success" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-0">{prescricoes.length}</h3>
              <p className="text-muted mb-0">Prescrições</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <i className="bi bi-clipboard2-pulse text-info" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2 mb-0">{exames.length}</h3>
              <p className="text-muted mb-0">Exames Realizados</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <Tabs defaultActiveKey="consultas" className="mb-3">
            {/* Aba de Consultas */}
            <Tab 
              eventKey="consultas" 
              title={
                <>
                  <i className="bi bi-calendar-check me-2"></i>
                  Consultas ({consultas.length})
                </>
              }
            >
              {consultas.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Médico</th>
                        <th>Especialidade</th>
                        <th>Tipo</th>
                        <th>Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultas.map((consulta) => (
                        <tr key={consulta.id}>
                          <td>{formatarDataHora(consulta.data_hora)}</td>
                          <td>{consulta.medico?.pessoa?.nome_completo || 'N/A'}</td>
                          <td>{consulta.medico?.especialidade || 'N/A'}</td>
                          <td>
                            <Badge bg="info">
                              {consulta.tipo_consulta || 'Consulta'}
                            </Badge>
                          </td>
                          <td className="small">{consulta.observacoes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">Nenhuma consulta realizada ainda</p>
                </div>
              )}
            </Tab>

            {/* Aba de Prescrições */}
            <Tab 
              eventKey="prescricoes" 
              title={
                <>
                  <i className="bi bi-capsule me-2"></i>
                  Prescrições ({prescricoes.length})
                </>
              }
            >
              {prescricoes.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Médico</th>
                        <th>Medicamento</th>
                        <th>Dosagem</th>
                        <th>Duração</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescricoes.map((prescricao) => (
                        <tr key={prescricao.id}>
                          <td>{formatarData(prescricao.data)}</td>
                          <td>{prescricao.medico?.pessoa?.nome_completo || 'N/A'}</td>
                          <td><strong>{prescricao.medicamento}</strong></td>
                          <td>{prescricao.dosagem}</td>
                          <td>{prescricao.duracao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">
                    {prescricoes.length === 0 && consultas.length > 0
                      ? 'Nenhuma prescrição registrada'
                      : 'Este recurso estará disponível em breve'}
                  </p>
                </div>
              )}
            </Tab>

            {/* Aba de Exames */}
            <Tab 
              eventKey="exames" 
              title={
                <>
                  <i className="bi bi-clipboard2-pulse me-2"></i>
                  Exames ({exames.length})
                </>
              }
            >
              {exames.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Tipo de Exame</th>
                        <th>Médico Solicitante</th>
                        <th>Status</th>
                        <th>Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exames.map((exame) => (
                        <tr key={exame.id}>
                          <td>{formatarData(exame.data)}</td>
                          <td><strong>{exame.tipo}</strong></td>
                          <td>{exame.medico?.pessoa?.nome_completo || 'N/A'}</td>
                          <td>
                            <Badge bg={exame.status === 'CONCLUIDO' ? 'success' : 'warning'}>
                              {exame.status}
                            </Badge>
                          </td>
                          <td>
                            {exame.resultado_disponivel ? (
                              <a href="#" className="btn btn-sm btn-outline-primary">
                                <i className="bi bi-download me-1"></i>
                                Baixar
                              </a>
                            ) : (
                              <span className="text-muted small">Pendente</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">
                    {exames.length === 0 && consultas.length > 0
                      ? 'Nenhum exame solicitado'
                      : 'Este recurso estará disponível em breve'}
                  </p>
                </div>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mt-4 border-info">
        <Card.Body>
          <h6 className="text-info">
            <i className="bi bi-info-circle me-2"></i>
            Sobre seu Histórico Médico
          </h6>
          <ul className="mb-0 small">
            <li>Seu histórico é confidencial e protegido pela Lei de Proteção de Dados</li>
            <li>Apenas você e profissionais autorizados têm acesso</li>
            <li>Mantenha sempre seus dados de contato atualizados</li>
            <li>Em caso de dúvidas, entre em contato com a recepção</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HistoricoMedico;

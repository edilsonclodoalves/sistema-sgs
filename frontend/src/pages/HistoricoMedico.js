import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Tabs, Tab, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const HistoricoMedico = () => {
  const { user, getPacienteId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pacienteId, setPacienteId] = useState(null);
  
  const [consultas, setConsultas] = useState([]);
  const [prescricoes, setPrescricoes] = useState([]);
  const [exames, setExames] = useState([]);

  const [contagemPrescricoes, setContagemPrescricoes] = useState(0);
  const [contagemExames, setContagemExames] = useState(0);

  const [loadingPrescricoes, setLoadingPrescricoes] = useState(false);
  const [loadingExames, setLoadingExames] = useState(false);

  useEffect(() => {
    carregarDadosIniciais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarDadosIniciais = async () => {
    try {
      setLoading(true);
      setError('');

      // Verificar se é um paciente
      if (user.perfil !== 'PACIENTE') {
        setError('Apenas pacientes podem visualizar o histórico médico');
        setLoading(false);
        return;
      }

      // Usar o helper do AuthContext para obter o paciente_id
      const idPaciente = getPacienteId();

      if (!idPaciente) {
        // Fallback: tentar buscar via API
        try {
          const pacienteRes = await api.get('/pacientes/meu-perfil');
          const idFromApi = pacienteRes.data.id;
          
          if (idFromApi) {
            setPacienteId(idFromApi);
            await carregarHistorico(idFromApi);
          } else {
            setError('Não foi possível identificar seus dados de paciente');
            setLoading(false);
          }
        } catch (err) {
          console.error('Erro ao buscar perfil do paciente:', err);
          setError('Não foi possível carregar seus dados. Por favor, faça login novamente.');
          setLoading(false);
        }
      } else {
        // Sucesso: paciente_id encontrado no contexto
        setPacienteId(idPaciente);
        await carregarHistorico(idPaciente);
      }
    } catch (err) {
      console.error('Erro ao carregar dados iniciais:', err);
      setError('Erro ao carregar dados do paciente');
      setLoading(false);
    }
  };

  const carregarHistorico = async (idPaciente) => {
    try {
      // Carregar tudo no início
      await Promise.all([
        carregarConsultas(idPaciente),
        carregarPrescricoes(idPaciente),
        carregarExames(idPaciente)
      ]);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setError('Erro ao carregar histórico médico');
    } finally {
      setLoading(false);
    }
  };

  const carregarConsultas = async (idPaciente) => {
    try {
      const consultasRes = await api.get('/consultas', {
        params: { paciente_id: idPaciente }
      });
      
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
  };

  const carregarPrescricoes = async (idPaciente) => {
    try {
      const prescricoesRes = await api.get(`/prescricoes/paciente/${idPaciente}`);
      
      const prescricoesData = Array.isArray(prescricoesRes.data)
        ? prescricoesRes.data
        : prescricoesRes.data.prescricoes || [];
      
      setPrescricoes(prescricoesData);
      setContagemPrescricoes(prescricoesData.length);
    } catch (err) {
      console.error('Erro ao carregar prescrições:', err);
      if (err.response?.status !== 404) {
        setError('Erro ao carregar prescrições');
      }
      setPrescricoes([]);
      setContagemPrescricoes(0);
    }
  };

  const carregarExames = async (idPaciente) => {
    try {
      const examesRes = await api.get(`/exames/paciente/${idPaciente}`);
      
      const examesData = Array.isArray(examesRes.data)
        ? examesRes.data
        : examesRes.data.exames || [];
      
      setExames(examesData);
      setContagemExames(examesData.length);
    } catch (err) {
      console.error('Erro ao carregar exames:', err);
      setExames([]);
      setContagemExames(0);
    }
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
  };

  const formatarDataHora = (dataHora) => {
    if (!dataHora) return 'N/A';
    try {
      const date = new Date(dataHora);
      return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } catch {
      return 'N/A';
    }
  };

  const handleTabSelect = (key) => {
    // Agora não precisa mais carregar ao clicar, pois já está tudo carregado
  };

  const recarregarPrescricoes = async () => {
    if (!pacienteId) return;
    
    try {
      setLoadingPrescricoes(true);
      await carregarPrescricoes(pacienteId);
    } finally {
      setLoadingPrescricoes(false);
    }
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
          <Tabs defaultActiveKey="consultas" className="mb-3" onSelect={handleTabSelect}>
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
                <>
                  {/* <div className="d-flex justify-content-end mb-3">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={recarregarPrescricoes}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Atualizar
                    </Button>
                  </div> */}
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Médico</th>
                          <th>Medicamento</th>
                          <th>Dosagem</th>
                          <th>Via</th>
                          <th>Frequência</th>
                          <th>Duração</th>
                          <th>Observações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescricoes.map((prescricao) => (
                          <tr key={prescricao.id}>
                            <td>{formatarData(prescricao.data_prescricao || prescricao.createdAt)}</td>
                            <td>
                              <div>
                                <strong>{prescricao.medico?.pessoa?.nome_completo || 'N/A'}</strong>
                                <div className="small text-muted">
                                  {prescricao.medico?.especialidade && (
                                    <><i className="bi bi-award me-1"></i>{prescricao.medico.especialidade}</>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td><strong className="text-primary">{prescricao.medicamento}</strong></td>
                            <td>{prescricao.dosagem || '-'}</td>
                            <td>
                              <Badge bg="secondary" className="text-uppercase">
                                {prescricao.via_administracao || '-'}
                              </Badge>
                            </td>
                            <td>{prescricao.frequencia || '-'}</td>
                            <td>
                              <Badge bg="info">
                                {prescricao.duracao || '-'}
                              </Badge>
                            </td>
                            <td className="small text-muted" style={{ maxWidth: '200px' }}>
                              {prescricao.observacoes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">Nenhuma prescrição registrada</p>
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
                        <th>Data Solicitação</th>
                        <th>Tipo de Exame</th>
                        <th>Médico Solicitante</th>
                        <th>Status</th>
                        <th>Data Realização</th>
                        <th>Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exames.map((exame) => (
                        <tr key={exame.id}>
                          <td>{formatarData(exame.data_solicitacao || exame.createdAt)}</td>
                          <td><strong className="text-primary">{exame.tipo_exame || exame.tipo || exame.nome}</strong></td>
                          <td>
                            <div>
                              <strong>{exame.medico_solicitante?.pessoa?.nome_completo || 'N/A'}</strong>
                              <div className="small text-muted">
                                {exame.medico_solicitante?.especialidade && (
                                  <><i className="bi bi-award me-1"></i>{exame.medico_solicitante.especialidade}</>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge bg={
                              exame.status === 'REALIZADO' ? 'success' : 
                              exame.status === 'AGENDADO' ? 'warning' : 
                              exame.status === 'PENDENTE' ? 'secondary' :
                              'info'
                            }>
                              {exame.status}
                            </Badge>
                          </td>
                          <td>
                            {exame.data_realizacao ? (
                              formatarData(exame.data_realizacao)
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                          <td>
                            {exame.status === 'REALIZADO' && exame.resultado ? (
                              <Button 
                                size="sm" 
                                variant="outline-success"
                                onClick={() => alert(`Resultado:\n\n${exame.resultado}`)}
                                title="Clique para ver o resultado completo"
                              >
                                <i className="bi bi-eye me-1"></i>
                                Ver Resultado
                              </Button>
                            ) : exame.arquivo_resultado ? (
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => console.log('Download do resultado:', exame.id)}
                              >
                                <i className="bi bi-download me-1"></i>
                                Baixar
                              </Button>
                            ) : (
                              <span className="text-muted small">Pendente</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  
                  {/* Card com observações quando houver */}
                  {exames.some(e => e.observacoes) && (
                    <Card className="mt-3 border-info">
                      <Card.Body>
                        <h6 className="text-info mb-3">
                          <i className="bi bi-info-circle me-2"></i>
                          Observações dos Exames
                        </h6>
                        {exames.filter(e => e.observacoes).map((exame) => (
                          <div key={exame.id} className="mb-2">
                            <strong className="small">{exame.tipo_exame}:</strong>
                            <span className="small text-muted ms-2">{exame.observacoes}</span>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">Nenhum exame solicitado</p>
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
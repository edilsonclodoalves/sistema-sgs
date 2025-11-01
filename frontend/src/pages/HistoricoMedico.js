import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Accordion, Form, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import prontuarioService from '../services/prontuarioService';

const HistoricoMedico = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [historico, setHistorico] = useState([]);
  const [exames, setExames] = useState([]);
  const [prescricoes, setPrescricoes] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [periodo, setPeriodo] = useState('ultimo_ano');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [historicoData, examesData, prescricoesData] = await Promise.all([
        prontuarioService.buscarHistorico(user.id),
        prontuarioService.listarExames(user.id),
        prontuarioService.listarPrescricoes(user.id)
      ]);

      setHistorico(historicoData);
      setExames(examesData);
      setPrescricoes(prescricoesData);
    } catch (error) {
      toast.error('Erro ao carregar histórico médico');
    } finally {
      setLoading(false);
    }
  };

  const baixarRelatorio = async () => {
    try {
      const blob = await prontuarioService.baixarRelatorio(user.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historico_medico_${user.nome}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao baixar relatório');
    }
  };

  const filtrarPorPeriodo = (items) => {
    const hoje = new Date();
    let dataLimite = new Date();

    switch (periodo) {
      case 'ultimo_mes':
        dataLimite.setMonth(hoje.getMonth() - 1);
        break;
      case 'ultimos_6_meses':
        dataLimite.setMonth(hoje.getMonth() - 6);
        break;
      case 'ultimo_ano':
        dataLimite.setFullYear(hoje.getFullYear() - 1);
        break;
      default:
        return items;
    }

    return items.filter(item => 
      new Date(item.data || item.data_consulta) >= dataLimite
    );
  };

  const dadosFiltrados = () => {
    switch (filtro) {
      case 'consultas':
        return filtrarPorPeriodo(historico);
      case 'exames':
        return filtrarPorPeriodo(exames);
      case 'prescricoes':
        return filtrarPorPeriodo(prescricoes);
      default:
        return {
          consultas: filtrarPorPeriodo(historico),
          exames: filtrarPorPeriodo(exames),
          prescricoes: filtrarPorPeriodo(prescricoes)
        };
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-3">Carregando histórico médico...</p>
      </Container>
    );
  }

  const dados = dadosFiltrados();

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h2>
                    <i className="bi bi-file-medical text-primary me-2"></i>
                    Histórico Médico
                  </h2>
                  <p className="text-muted mb-0">Visualize seu histórico completo de atendimentos</p>
                </div>
                <div className="mt-3 mt-md-0">
                  <Button variant="primary" onClick={baixarRelatorio}>
                    <i className="bi bi-download me-2"></i>
                    Baixar Relatório PDF
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Filtrar por:</Form.Label>
            <Form.Select 
              value={filtro} 
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="consultas">Consultas</option>
              <option value="exames">Exames</option>
              <option value="prescricoes">Prescrições</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Período:</Form.Label>
            <Form.Select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)}
            >
              <option value="ultimo_mes">Último mês</option>
              <option value="ultimos_6_meses">Últimos 6 meses</option>
              <option value="ultimo_ano">Último ano</option>
              <option value="todos">Todo o período</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Estatísticas */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="text-center h-100 border-primary">
            <Card.Body>
              <i className="bi bi-calendar-check text-primary" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2">{historico.length}</h3>
              <p className="text-muted mb-0">Consultas Realizadas</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100 border-success">
            <Card.Body>
              <i className="bi bi-clipboard2-pulse text-success" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2">{exames.length}</h3>
              <p className="text-muted mb-0">Exames Realizados</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100 border-info">
            <Card.Body>
              <i className="bi bi-capsule text-info" style={{ fontSize: '2rem' }}></i>
              <h3 className="mt-2">{prescricoes.length}</h3>
              <p className="text-muted mb-0">Prescrições</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Conteúdo do Histórico */}
      <Row>
        <Col>
          {(filtro === 'todos' || filtro === 'consultas') && dados.consultas?.length > 0 && (
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-calendar-check me-2"></i>
                  Consultas Médicas
                </h5>
              </Card.Header>
              <Card.Body>
                <Accordion>
                  {dados.consultas.map((consulta, index) => (
                    <Accordion.Item eventKey={index.toString()} key={consulta.id}>
                      <Accordion.Header>
                        <div className="d-flex justify-content-between w-100 pe-3">
                          <span>
                            <strong>{consulta.especialidade || 'Consulta Geral'}</strong>
                            {' - '} 
                            Dr(a). {consulta.medico?.nome || 'N/A'}
                          </span>
                          <Badge bg="info">
                            {new Date(consulta.data_consulta).toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <p><strong>Data:</strong> {new Date(consulta.data_consulta).toLocaleDateString('pt-BR')}</p>
                            <p><strong>Horário:</strong> {consulta.horario}</p>
                            <p><strong>Médico:</strong> Dr(a). {consulta.medico?.nome}</p>
                            <p><strong>Especialidade:</strong> {consulta.especialidade}</p>
                          </Col>
                          <Col md={6}>
                            <p><strong>Tipo:</strong> <span className="text-capitalize">{consulta.tipo?.replace('_', ' ')}</span></p>
                            <p><strong>Status:</strong> <Badge bg="success">{consulta.status}</Badge></p>
                            {consulta.diagnostico && (
                              <p><strong>Diagnóstico:</strong> {consulta.diagnostico}</p>
                            )}
                          </Col>
                        </Row>
                        {consulta.observacoes && (
                          <div className="mt-2">
                            <strong>Observações:</strong>
                            <p className="mb-0 mt-1">{consulta.observacoes}</p>
                          </div>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card.Body>
            </Card>
          )}

          {(filtro === 'todos' || filtro === 'exames') && dados.exames?.length > 0 && (
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-clipboard2-pulse me-2"></i>
                  Exames
                </h5>
              </Card.Header>
              <Card.Body>
                <Accordion>
                  {dados.exames.map((exame, index) => (
                    <Accordion.Item eventKey={index.toString()} key={exame.id}>
                      <Accordion.Header>
                        <div className="d-flex justify-content-between w-100 pe-3">
                          <span><strong>{exame.tipo_exame}</strong></span>
                          <Badge bg="success">
                            {new Date(exame.data).toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <p><strong>Tipo de Exame:</strong> {exame.tipo_exame}</p>
                            <p><strong>Data:</strong> {new Date(exame.data).toLocaleDateString('pt-BR')}</p>
                            <p><strong>Solicitado por:</strong> Dr(a). {exame.medico?.nome}</p>
                          </Col>
                          <Col md={6}>
                            <p><strong>Status:</strong> <Badge bg={exame.status === 'concluido' ? 'success' : 'warning'}>{exame.status}</Badge></p>
                            {exame.resultado && (
                              <p><strong>Resultado:</strong> {exame.resultado}</p>
                            )}
                          </Col>
                        </Row>
                        {exame.observacoes && (
                          <div className="mt-2">
                            <strong>Observações:</strong>
                            <p className="mb-0 mt-1">{exame.observacoes}</p>
                          </div>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card.Body>
            </Card>
          )}

          {(filtro === 'todos' || filtro === 'prescricoes') && dados.prescricoes?.length > 0 && (
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">
                  <i className="bi bi-capsule me-2"></i>
                  Prescrições Médicas
                </h5>
              </Card.Header>
              <Card.Body>
                <Accordion>
                  {dados.prescricoes.map((prescricao, index) => (
                    <Accordion.Item eventKey={index.toString()} key={prescricao.id}>
                      <Accordion.Header>
                        <div className="d-flex justify-content-between w-100 pe-3">
                          <span><strong>{prescricao.medicamento}</strong></span>
                          <Badge bg="info">
                            {new Date(prescricao.data).toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <p><strong>Medicamento:</strong> {prescricao.medicamento}</p>
                            <p><strong>Dosagem:</strong> {prescricao.dosagem}</p>
                            <p><strong>Frequência:</strong> {prescricao.frequencia}</p>
                            <p><strong>Duração:</strong> {prescricao.duracao}</p>
                          </Col>
                          <Col md={6}>
                            <p><strong>Data da Prescrição:</strong> {new Date(prescricao.data).toLocaleDateString('pt-BR')}</p>
                            <p><strong>Prescrito por:</strong> Dr(a). {prescricao.medico?.nome}</p>
                            <p><strong>Status:</strong> <Badge bg={prescricao.status === 'ativa' ? 'success' : 'secondary'}>{prescricao.status}</Badge></p>
                          </Col>
                        </Row>
                        {prescricao.observacoes && (
                          <div className="mt-2">
                            <strong>Observações:</strong>
                            <p className="mb-0 mt-1">{prescricao.observacoes}</p>
                          </div>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card.Body>
            </Card>
          )}

          {/* Mensagem quando não há dados */}
          {(filtro === 'consultas' && dados.length === 0) ||
           (filtro === 'exames' && dados.length === 0) ||
           (filtro === 'prescricoes' && dados.length === 0) ||
           (filtro === 'todos' && dados.consultas?.length === 0 && dados.exames?.length === 0 && dados.prescricoes?.length === 0) && (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              Nenhum registro encontrado para o filtro e período selecionados.
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default HistoricoMedico;

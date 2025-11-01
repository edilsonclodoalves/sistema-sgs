# 📊 VISÃO GERAL DO SISTEMA

## Sistema de Gestão de Saúde Municipal - Frontend React

---

## 🎯 Implementação dos Requisitos do PDF

### ✅ Requisitos Funcionais Implementados

| ID | Requisito | Status | Página/Componente |
|---|---|---|---|
| RF01 | Agendamento de Consultas Online | ✅ Implementado | AgendarConsulta.js |
| RF02 | Consulta de Filas e Tempo de Espera | ✅ Implementado | FilasAtendimento.js |
| RF03 | Histórico Médico do Paciente | ✅ Implementado | HistoricoMedico.js |
| RF04 | Notificações de Campanhas de Vacinação | ✅ Implementado | Sistema de notificações |
| RF05 | Localização de Unidades de Saúde | ✅ Implementado | UnidadesSaude.js |
| RF06 | Avaliação de Atendimento | ✅ Implementado | Sistema de feedback |

### ✅ Requisitos Não Funcionais Atendidos

| ID | Requisito | Como foi implementado |
|---|---|---|
| RNF01 | Performance (<3s) | React otimizado, lazy loading |
| RNF02 | Usabilidade/Acessibilidade | Bootstrap, ícones intuitivos, WCAG 2.1 |
| RNF03 | Disponibilidade (99,8%) | Arquitetura resiliente, tratamento de erros |
| RNF04 | Segurança/LGPD | JWT, criptografia, validações |
| RNF05 | Escalabilidade | React + Context API, código modular |

---

## 🔄 Casos de Uso Implementados

### UC01 - Agendar Consulta Médica

**Arquivo:** `src/pages/AgendarConsulta.js`

**Fluxo Implementado (4 Etapas):**

1. **Etapa 1: Tipo de Consulta**
   - Seleção do tipo (primeira consulta, retorno, emergência)
   - Escolha da especialidade médica

2. **Etapa 2: Unidade e Médico**
   - Seleção da unidade de saúde próxima
   - Escolha do médico especialista

3. **Etapa 3: Data e Horário**
   - Calendário com próximos 30 dias
   - Horários disponíveis em tempo real
   - Campo de observações

4. **Etapa 4: Confirmação**
   - Revisão de todos os dados
   - Confirmação do agendamento
   - Geração de protocolo

**Características:**
- ✅ Validação em cada etapa
- ✅ Navegação entre etapas (voltar/avançar)
- ✅ Feedback visual de progresso
- ✅ Integração com API backend

---

### UC02 - Consultar Histórico Médico

**Arquivo:** `src/pages/HistoricoMedico.js`

**Funcionalidades Implementadas:**

1. **Visualização Completa**
   - Consultas realizadas
   - Exames realizados
   - Prescrições médicas

2. **Filtros Avançados**
   - Por tipo de registro
   - Por período (último mês, 6 meses, ano)

3. **Estatísticas**
   - Total de consultas
   - Total de exames
   - Total de prescrições

4. **Exportação**
   - Download de relatório em PDF
   - Histórico completo formatado

**Características:**
- ✅ Acordeão expansível para detalhes
- ✅ Badges coloridos para status
- ✅ Informações detalhadas de cada registro
- ✅ Interface responsiva

---

## 📱 Páginas Principais

### 1. Home (Home.js)
**Funcionalidade:** Página inicial com visão geral dos serviços

**Elementos:**
- Hero section com boas-vindas
- Cards de serviços principais
- Botões de ação (Login/Cadastro para não autenticados)
- Seção "Como funciona" em 4 passos

---

### 2. Login (Login.js)
**Funcionalidade:** Autenticação de usuários

**Elementos:**
- Campo de CPF com máscara automática
- Campo de senha
- Link para recuperação de senha
- Link para cadastro
- Feedback de erros

---

### 3. Cadastro (Cadastro.js)
**Funcionalidade:** Registro de novos usuários

**Campos:**
- Nome completo
- CPF (com formatação)
- Data de nascimento
- Telefone (com máscara)
- E-mail
- Endereço e CEP
- Senha e confirmação

**Validações:**
- ✅ CPF válido
- ✅ E-mail válido
- ✅ Senhas coincidentes
- ✅ Todos os campos obrigatórios

---

### 4. Agendar Consulta (AgendarConsulta.js)
**Funcionalidade:** UC01 - Sistema completo de agendamento

**Destaques:**
- Wizard de 4 etapas com indicador visual
- Carregamento dinâmico de médicos e horários
- Validação em tempo real
- Confirmação visual antes de finalizar

---

### 5. Minhas Consultas (MinhasConsultas.js)
**Funcionalidade:** Gerenciamento de consultas agendadas

**Elementos:**
- Tabela de consultas futuras
- Opção de cancelamento
- Histórico de consultas passadas
- Status coloridos (agendada, confirmada, cancelada, realizada)

---

### 6. Histórico Médico (HistoricoMedico.js)
**Funcionalidade:** UC02 - Visualização completa do prontuário

**Seções:**
- Consultas médicas (com diagnósticos)
- Exames realizados (com resultados)
- Prescrições (medicamentos, dosagens)
- Estatísticas de atendimento
- Download de relatório PDF

---

### 7. Filas de Atendimento (FilasAtendimento.js)
**Funcionalidade:** RF02 - Visualização em tempo real

**Elementos:**
- Cards por unidade de saúde
- Número de pessoas na fila
- Tempo estimado de espera
- Nível de ocupação (cores)
- Atualização automática a cada 30s

**Indicadores:**
- 🟢 Verde: Baixa (0-5 pessoas)
- 🟡 Amarelo: Moderada (6-10 pessoas)
- 🔴 Vermelho: Alta (11+ pessoas)

---

### 8. Unidades de Saúde (UnidadesSaude.js)
**Funcionalidade:** RF05 - Localização e informações

**Informações por Unidade:**
- Nome e tipo (UBS/Hospital)
- Endereço completo
- Telefone de contato
- Horário de funcionamento
- Especialidades disponíveis
- Botão "Ver no Mapa" (Google Maps)

**Filtros:**
- Por especialidade médica

---

## 🎨 Componentes Reutilizáveis

### Navigation.js
**Descrição:** Barra de navegação principal

**Características:**
- Responsiva (collapse em mobile)
- Menu dinâmico baseado em autenticação
- Dropdown de usuário
- Ícones Bootstrap
- Links para todas as páginas

---

## 🔒 Segurança e Autenticação

### AuthContext.js
**Funcionalidade:** Gerenciamento global de autenticação

**Recursos:**
- Login/Logout
- Registro de usuários
- Persistência de sessão (localStorage)
- Proteção de rotas privadas
- Refresh automático de token

### ProtectedRoute
**Funcionalidade:** HOC para proteger rotas privadas

**Comportamento:**
- Verifica autenticação do usuário
- Redireciona para login se não autenticado
- Exibe loading durante verificação

---

## 🌐 Serviços de API

### api.js
**Configuração base do Axios:**
- Base URL configurável
- Timeout de 10s
- Interceptor de requisição (adiciona token)
- Interceptor de resposta (trata erros)

### consultaService.js
**Endpoints de consultas:**
- Listar consultas
- Agendar consulta
- Cancelar consulta
- Listar médicos
- Horários disponíveis

### prontuarioService.js
**Endpoints de prontuário:**
- Buscar histórico
- Listar exames
- Listar prescrições
- Download de relatório PDF

---

## 🎨 Estilos e Design

### custom.css
**Customizações:**
- Variáveis CSS para cores
- Efeitos de hover em cards
- Animações suaves
- Scrollbar customizado
- Classes utilitárias
- Responsividade mobile

### Bootstrap 5
**Componentes utilizados:**
- Navbar
- Cards
- Forms
- Buttons
- Badges
- Tables
- Modals
- Accordion
- Progress Bar
- Alerts

---

## 🚀 Tecnologias e Boas Práticas

### React Hooks Utilizados
- `useState` - Estado local
- `useEffect` - Efeitos colaterais
- `useContext` - Context API
- `useNavigate` - Navegação programática

### Padrões Implementados
- ✅ Component-based architecture
- ✅ Separation of concerns
- ✅ Reusable components
- ✅ Context API for state management
- ✅ Service layer for API calls
- ✅ Protected routes
- ✅ Error handling
- ✅ Loading states
- ✅ Form validation
- ✅ Responsive design

---

## 📊 Métricas de Qualidade

### Performance
- ✅ Lazy loading de componentes
- ✅ Otimização de re-renders
- ✅ Memoização quando necessário
- ✅ Bundle size otimizado

### Acessibilidade
- ✅ Ícones com significado claro
- ✅ Labels em todos os formulários
- ✅ Cores com contraste adequado
- ✅ Feedback visual de ações
- ✅ Mensagens de erro descritivas

### Usabilidade
- ✅ Navegação intuitiva
- ✅ Feedback imediato de ações
- ✅ Mensagens claras
- ✅ Interface consistente
- ✅ Responsividade mobile

---

## 📈 Alinhamento com Normas

### CMMI - Requirements Management (REQM)
**SP 1.4 - Maintain Bidirectional Traceability**

Rastreabilidade implementada:
- Requisitos → Componentes → Testes
- RF01 → AgendarConsulta.js → Fluxo de 4 etapas
- RF02 → FilasAtendimento.js → Atualização em tempo real
- RF03 → HistoricoMedico.js → Visualização completa

### ISO 25010 - Reliability (Fault Tolerance)

Tolerância a falhas implementada:
- Try-catch em todas as chamadas de API
- Tratamento de erros com feedback ao usuário
- Estados de loading durante requisições
- Validações antes de enviar dados
- Rollback em caso de falha

---

## 🎯 Conclusão

Este frontend implementa **100% dos requisitos funcionais** do Projeto A3:
- ✅ Todos os 6 RF implementados
- ✅ Todos os 5 RNF atendidos
- ✅ UC01 e UC02 completos
- ✅ Interface profissional e intuitiva
- ✅ Código organizado e documentado
- ✅ Pronto para integração com backend
- ✅ Alinhado com CMMI e ISO 25010

**Total de arquivos criados:** 20+
**Total de páginas:** 8
**Total de serviços:** 3
**Total de componentes reutilizáveis:** 2+

---

**Desenvolvido pela equipe do Projeto A3**
**Disciplina: Gestão de Qualidade de Software**
**2º Semestre/2025 - Ecossistema Ânima - LIVE**

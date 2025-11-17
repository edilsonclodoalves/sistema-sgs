# 🏥 Sistema de Gestão de Saúde - Frontend

Sistema completo para gestão de serviços de saúde municipal desenvolvido com React e Bootstrap, implementando todos os requisitos funcionais do Projeto A3.

## 📋 Sobre o Projeto

Este é o frontend do Sistema de Gestão de Saúde Municipal, desenvolvido como parte do Projeto A3 da disciplina de Gestão de Qualidade de Software. O sistema permite que cidadãos:

- ✅ Agendem consultas médicas online
- ✅ Consultem histórico médico completo
- ✅ Visualizem filas de atendimento em tempo real
- ✅ Localizem unidades de saúde próximas
- ✅ Recebam notificações de campanhas de vacinação
- ✅ Avaliem serviços de saúde

## 🎯 Requisitos Implementados

### Requisitos Funcionais (RF)

- **RF01** - Agendamento de Consultas Online ✅
- **RF02** - Consulta de Filas e Tempo de Espera ✅
- **RF03** - Histórico Médico do Paciente ✅
- **RF04** - Notificações de Campanhas de Vacinação ✅
- **RF05** - Localização de Unidades de Saúde ✅
- **RF06** - Avaliação de Atendimento ✅

### Casos de Uso

- **UC01** - Agendar Consulta Médica ✅
- **UC02** - Consultar Histórico Médico ✅

## 🛠️ Tecnologias Utilizadas

- **React** 18.2.0 - Biblioteca JavaScript para construção de interfaces
- **React Router DOM** 6.20.0 - Gerenciamento de rotas
- **Bootstrap** 5.3.2 - Framework CSS
- **React Bootstrap** 2.9.1 - Componentes React do Bootstrap
- **Bootstrap Icons** - Ícones
- **Axios** - Cliente HTTP para requisições à API
- **React Toastify** - Notificações toast
- **Context API** - Gerenciamento de estado global

## 📁 Estrutura do Projeto

```
sistema-saude-frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── Navigation.js          # Barra de navegação
│   ├── contexts/
│   │   └── AuthContext.js         # Contexto de autenticação
│   ├── pages/
│   │   ├── Home.js                # Página inicial
│   │   ├── Login.js               # Página de login
│   │   ├── AgendarConsulta.js     # UC01 - Agendamento
│   │   ├── MinhasConsultas.js     # Lista de consultas
│   │   ├── HistoricoMedico.js     # UC02 - Histórico
│   │   ├── FilasAtendimento.js    # Filas em tempo real
│   │   └── UnidadesSaude.js       # Localização de unidades
│   ├── services/
│   │   ├── api.js                 # Configuração do Axios
│   │   ├── consultaService.js     # Serviços de consulta
│   │   └── prontuarioService.js   # Serviços de prontuário
│   ├── styles/
│   │   └── custom.css             # Estilos customizados
│   ├── App.js                     # Componente principal
│   ├── index.js                   # Ponto de entrada
│   └── reportWebVitals.js         # Métricas de performance
├── .env.example                   # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- Backend da API rodando (veja pasta clinica-api)

### Instalação

1. Clone o repositório ou extraia os arquivos

2. Entre na pasta do frontend:
```bash
cd sistema-saude-frontend
```

3. Instale as dependências:
```bash
npm install
```

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

5. Edite o arquivo `.env` e configure a URL da API:
```
REACT_APP_API_URL=http://localhost:3001/api
```

6. Inicie o servidor de desenvolvimento:
```bash
npm start
```

7. Acesse a aplicação em: [http://localhost:3000](http://localhost:3000)

## 🔑 Funcionalidades Principais

### 1. Autenticação
- Login com CPF e senha
- Cadastro de novos usuários
- Logout seguro
- Proteção de rotas privadas

### 2. Agendamento de Consultas (UC01)
Fluxo em 4 etapas:
1. Seleção do tipo de consulta e especialidade
2. Escolha da unidade de saúde e médico
3. Seleção de data e horário disponível
4. Confirmação dos dados

### 3. Histórico Médico (UC02)
- Visualização completa do histórico
- Filtros por tipo (consultas, exames, prescrições)
- Filtros por período
- Download de relatório em PDF
- Estatísticas de atendimentos

### 4. Minhas Consultas
- Lista de consultas agendadas
- Cancelamento de consultas
- Histórico de consultas realizadas

### 5. Filas de Atendimento
- Visualização em tempo real
- Tempo estimado de espera
- Nível de ocupação por cores
- Atualização automática

### 6. Unidades de Saúde
- Localização de unidades próximas
- Filtro por especialidade
- Informações de contato
- Integração com Google Maps
- Horários de funcionamento

## 🎨 Design e UX

### Princípios de Design
- **Acessibilidade**: Interface seguindo diretrizes WCAG 2.1
- **Responsividade**: Funciona em desktop, tablet e mobile
- **Usabilidade**: Navegação intuitiva e clara
- **Feedback Visual**: Toasts, badges e indicadores de status

### Paleta de Cores
- **Primary**: #0d6efd (Azul)
- **Success**: #198754 (Verde)
- **Danger**: #dc3545 (Vermelho)
- **Warning**: #ffc107 (Amarelo)
- **Info**: #0dcaf0 (Ciano)

## 📱 Responsividade

O sistema é totalmente responsivo e se adapta a diferentes tamanhos de tela:
- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado com menu colapsável
- **Mobile**: Interface otimizada para touch

## 🔒 Segurança

- Autenticação via JWT (JSON Web Token)
- Tokens armazenados no localStorage
- Interceptor para adicionar token nas requisições
- Redirecionamento automático em caso de token expirado
- Validação de formulários no frontend
- Sanitização de dados de entrada

## 🧪 Scripts Disponíveis

```bash
# Inicia o servidor de desenvolvimento
npm start

# Cria build de produção
npm run build

# Executa os testes
npm test

# Ejeta as configurações (irreversível)
npm run eject
```

## 📦 Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `build/` e estarão prontos para deploy.

## 🌐 Integração com Backend

O frontend se comunica com a API através do Axios. Configurações em `src/services/api.js`:

- Base URL configurável via variável de ambiente
- Timeout de 10 segundos
- Interceptor de requisição (adiciona token)
- Interceptor de resposta (trata erros)

### Endpoints Utilizados

**Autenticação:**
- POST `/auth/register` - Cadastro
- POST `/auth/login` - Login

**Consultas:**
- GET `/consultas` - Listar consultas
- POST `/consultas` - Agendar consulta
- DELETE `/consultas/:id` - Cancelar consulta
- GET `/medicos` - Listar médicos

**Prontuário:**
- GET `/prontuarios/paciente/:id` - Histórico
- GET `/exames/paciente/:id` - Exames
- GET `/prescricoes/paciente/:id` - Prescrições

## 🎯 Alinhamento com Normas de Qualidade

### CMMI - Capability Maturity Model Integration
- **REQM (Requirements Management)**: Rastreabilidade bidirecional implementada entre requisitos, componentes e testes

### ISO 25010 - System and Software Quality Models
- **Reliability (Confiabilidade)**: Tratamento de erros, validações e feedback ao usuário
- **Usability (Usabilidade)**: Interface intuitiva e acessível
- **Performance**: Otimização de requisições e carregamento
- **Security (Segurança)**: Autenticação e autorização implementadas

## 👥 Equipe de Desenvolvimento

- **Edilson Clodoalves Galvão de Lima** - 32214931
- **Flávio Grego Santiago** - 322129707
- **Marina Mara Velozo** - 825164167
- **Weverton Araujo Martins** - 32210007

### Orientadores
- **Prof. Giuliano Richards Ribeiro**
- **Prof. Otacilio José Pereira**

## 📝 Licença

Este projeto foi desenvolvido para fins acadêmicos como parte do Projeto A3 - 2º Semestre/2025.

**Instituição:** Ecossistema Ânima - LIVE  
**Disciplina:** Gestão de Qualidade de Software

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento

## 🔄 Próximas Melhorias

- [ ] Implementar notificações push
- [ ] Adicionar chat online com profissionais
- [ ] Telemedicina integrada
- [ ] Aplicativo mobile nativo
- [ ] Dashboard administrativo
- [ ] Relatórios analíticos
- [ ] Integração com wearables

---

**Desenvolvido com ❤️ pela equipe do Projeto A3**

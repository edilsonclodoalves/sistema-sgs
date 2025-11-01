# 🏥 Sistema de Gestão de Saúde - Backend API

API RESTful completa para o Sistema de Gestão de Saúde Municipal, desenvolvida com Node.js, Express e MySQL.

## 📋 Sobre o Projeto

Backend do Sistema de Gestão de Saúde desenvolvido para o Projeto A3 da disciplina de Gestão de Qualidade de Software. A API implementa todos os requisitos funcionais especificados no documento do projeto.

## 🎯 Requisitos Implementados

### Requisitos Funcionais

- ✅ **RF01** - Agendamento de Consultas Online
- ✅ **RF02** - Consulta de Filas e Tempo de Espera
- ✅ **RF03** - Histórico Médico do Paciente
- ✅ **RF04** - Notificações de Campanhas
- ✅ **RF05** - Localização de Unidades de Saúde
- ✅ **RF06** - Avaliação de Atendimento

### Casos de Uso

- ✅ **UC01** - Agendar Consulta Médica
- ✅ **UC02** - Consultar Histórico Médico

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL** - Banco de dados relacional
- **Sequelize** - ORM para Node.js
- **JWT** - Autenticação com tokens
- **bcrypt** - Criptografia de senhas
- **CORS** - Controle de acesso

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do banco
│   ├── controllers/
│   │   ├── authController.js    # Autenticação (login/registro)
│   │   ├── consultaController.js # UC01 - Agendamento
│   │   ├── prontuarioController.js # UC02 - Histórico
│   │   ├── medicoController.js   # Gestão de médicos
│   │   ├── pacienteController.js # Gestão de pacientes
│   │   ├── exameController.js    # Gestão de exames
│   │   └── prescricaoController.js # Gestão de prescrições
│   ├── middlewares/
│   │   └── authMiddleware.js     # Verificação de JWT
│   ├── models/
│   │   ├── Paciente.js           # Modelo de Paciente
│   │   ├── Medico.js             # Modelo de Médico
│   │   ├── Consulta.js           # Modelo de Consulta
│   │   ├── Prontuario.js         # Modelo de Prontuário
│   │   ├── Exame.js              # Modelo de Exame
│   │   ├── Prescricao.js         # Modelo de Prescrição
│   │   ├── Usuario.js            # Modelo de Usuário
│   │   └── index.js              # Exports dos modelos
│   ├── routes/
│   │   ├── authRoutes.js         # Rotas de autenticação
│   │   ├── consultaRoutes.js     # Rotas de consultas
│   │   ├── prontuarioRoutes.js   # Rotas de prontuário
│   │   ├── medicoRoutes.js       # Rotas de médicos
│   │   ├── pacienteRoutes.js     # Rotas de pacientes
│   │   ├── exameRoutes.js        # Rotas de exames
│   │   └── prescricaoRoutes.js   # Rotas de prescrições
│   └── utils/
│       └── initializeDatabase.js # Inicialização do DB
├── .env.example                   # Exemplo de variáveis
├── .gitignore
├── package.json
├── server.js                      # Servidor principal
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js v14 ou superior
- MySQL 5.7 ou superior
- npm ou yarn

### Instalação

1. **Clone o repositório ou extraia os arquivos**

2. **Entre na pasta do backend:**
```bash
cd sistema-saude-backend
```

3. **Instale as dependências:**
```bash
npm install
```

4. **Configure o banco de dados MySQL:**

Crie um banco de dados:
```sql
CREATE DATABASE sistema_saude CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **Configure as variáveis de ambiente:**

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=sistema_saude
DB_USER=root
DB_PASSWORD=sua_senha

JWT_SECRET=seu-secret-muito-seguro
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
```

6. **Inicie o servidor:**
```bash
npm start
```

Ou para desenvolvimento com auto-reload:
```bash
npm run dev
```

O servidor estará rodando em: `http://localhost:3001`

## 📡 Endpoints da API

### Autenticação

#### POST `/api/auth/register`
Cadastro de novo paciente

**Body:**
```json
{
  "nome": "João Silva",
  "cpf": "12345678900",
  "data_nascimento": "1990-01-01",
  "telefone": "11999999999",
  "email": "joao@email.com",
  "endereco": "Rua Exemplo, 123",
  "cep": "01234567",
  "senha": "senha123"
}
```

**Response (201):**
```json
{
  "message": "Cadastro realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "cpf": "12345678900",
    "tipo": "paciente"
  }
}
```

#### POST `/api/auth/login`
Login de paciente (com CPF) ou usuário (com email)

**Body (Paciente):**
```json
{
  "cpf": "12345678900",
  "senha": "senha123"
}
```

**Body (Usuário):**
```json
{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

**Response (200):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "cpf": "12345678900",
    "tipo": "paciente"
  }
}
```

#### GET `/api/auth/verify`
Verificar validade do token

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "valid": true,
  "usuario": {
    "id": 1,
    "email": "joao@email.com",
    "cpf": "12345678900",
    "tipo": "paciente"
  }
}
```

### Consultas

#### GET `/api/consultas`
Listar todas as consultas do paciente autenticado

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id_consulta": 1,
    "data_consulta": "2025-11-10",
    "horario": "14:00",
    "tipo": "primeira_consulta",
    "especialidade": "Cardiologia",
    "unidade": "UBS Centro",
    "status": "agendada",
    "protocolo": "CONS-1730483200000-123",
    "Medico": {
      "id_medico": 1,
      "nome": "Dr. Carlos Silva",
      "especialidade": "Cardiologia"
    }
  }
]
```

#### POST `/api/consultas`
Agendar nova consulta (UC01)

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "medico_id": 1,
  "data": "2025-11-10",
  "horario": "14:00",
  "tipo": "primeira_consulta",
  "especialidade": "Cardiologia",
  "unidade": "UBS Centro",
  "observacoes": "Dores no peito"
}
```

**Response (201):**
```json
{
  "message": "Consulta agendada com sucesso!",
  "consulta": {
    "id_consulta": 1,
    "data_consulta": "2025-11-10",
    "horario": "14:00",
    "status": "agendada",
    "protocolo": "CONS-1730483200000-123",
    "Medico": {
      "nome": "Dr. Carlos Silva"
    }
  }
}
```

#### GET `/api/consultas/horarios-disponiveis?medicoId=1&data=2025-11-10`
Listar horários disponíveis para um médico em uma data

**Response (200):**
```json
[
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "14:00",
  "14:30",
  "15:00"
]
```

#### GET `/api/consultas/:id`
Buscar consulta específica

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id_consulta": 1,
  "data_consulta": "2025-11-10",
  "horario": "14:00",
  "tipo": "primeira_consulta",
  "especialidade": "Cardiologia",
  "status": "agendada",
  "Medico": {
    "nome": "Dr. Carlos Silva"
  },
  "Paciente": {
    "nome": "João Silva"
  }
}
```

#### DELETE `/api/consultas/:id`
Cancelar consulta

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Consulta cancelada com sucesso"
}
```

### Médicos

#### GET `/api/medicos`
Listar todos os médicos

**Response (200):**
```json
{
  "status": "success",
  "message": "Médicos listados com sucesso",
  "data": {
    "medicos": [
      {
        "id_medico": 1,
        "nome": "Dr. Carlos Silva",
        "crm": "123456",
        "especialidade": "Cardiologia"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### Prontuário (UC02)

#### GET `/api/prontuarios/paciente/:id`
Buscar histórico médico completo do paciente

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id_prontuario": 1,
    "id_consulta": 1,
    "anotacoes": "Paciente com pressão alta",
    "diagnostico": "Hipertensão",
    "Consulta": {
      "data_consulta": "2025-10-15",
      "Medico": {
        "nome": "Dr. Carlos Silva"
      }
    }
  }
]
```

#### GET `/api/exames/paciente/:id`
Listar exames do paciente

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id_exame": 1,
    "tipo_exame": "Hemograma",
    "data": "2025-10-20",
    "resultado": "Normal",
    "status": "concluido"
  }
]
```

#### GET `/api/prescricoes/paciente/:id`
Listar prescrições do paciente

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id_prescricao": 1,
    "medicamento": "Losartana 50mg",
    "dosagem": "1 comprimido",
    "frequencia": "1x ao dia",
    "duracao": "30 dias",
    "status": "ativa",
    "data": "2025-10-15"
  }
]
```

## 🔒 Autenticação

A API usa JWT (JSON Web Token) para autenticação. Após fazer login ou registro, você receberá um token que deve ser incluído no header de todas as requisições protegidas:

```
Authorization: Bearer <seu-token>
```

O token expira em 7 dias por padrão (configurável no .env).

## 🗄️ Modelos de Dados

### Paciente
```javascript
{
  id_paciente: INTEGER (PK),
  nome: STRING,
  cpf: STRING (UNIQUE),
  data_nascimento: DATE,
  telefone: STRING,
  email: STRING,
  endereco: STRING,
  cep: STRING,
  senha: STRING (HASH),
  ativo: BOOLEAN
}
```

### Consulta
```javascript
{
  id_consulta: INTEGER (PK),
  id_paciente: INTEGER (FK),
  id_medico: INTEGER (FK),
  data_consulta: DATE,
  horario: STRING,
  tipo: ENUM,
  especialidade: STRING,
  unidade: STRING,
  status: ENUM,
  observacoes: TEXT,
  diagnostico: TEXT,
  protocolo: STRING (UNIQUE)
}
```

### Médico
```javascript
{
  id_medico: INTEGER (PK),
  nome: STRING,
  crm: STRING (UNIQUE),
  especialidade: STRING
}
```

## 🧪 Testes

Execute os testes:
```bash
npm test
```

## 📊 Scripts Disponíveis

```bash
# Iniciar servidor
npm start

# Iniciar em modo desenvolvimento (com nodemon)
npm run dev

# Executar testes
npm test

# Criar banco de dados
npm run db:create

# Popular banco com dados de teste
npm run db:seed
```

## 🔧 Configuração do CORS

O backend está configurado para aceitar requisições do frontend. Configure a origem no arquivo `.env`:

```env
CORS_ORIGIN=http://localhost:3000
```

Para permitir múltiplas origens em produção:
```javascript
// No server.js
app.use(cors({
  origin: ['https://seu-dominio.com', 'https://www.seu-dominio.com']
}));
```

## 🛡️ Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Autenticação JWT
- ✅ Validação de dados de entrada
- ✅ Proteção contra SQL Injection (Sequelize ORM)
- ✅ CORS configurado
- ✅ Headers de segurança
- ✅ Logs de erro

## 📈 Monitoramento e Logs

Os logs são exibidos no console durante o desenvolvimento. Para produção, considere usar ferramentas como:
- Winston para logging
- PM2 para gerenciamento de processos
- New Relic ou Datadog para monitoramento

## 🚀 Deploy

### Variáveis de Ambiente em Produção

Certifique-se de configurar todas as variáveis de ambiente:
- `NODE_ENV=production`
- `JWT_SECRET` (use um secret forte e único)
- Configurações do banco de dados
- `CORS_ORIGIN` com o domínio do frontend

### Recomendações

- Use HTTPS em produção
- Configure rate limiting
- Use um proxy reverso (nginx)
- Configure backup automático do banco
- Monitore logs e erros
- Use PM2 para gerenciar o processo

## 👥 Equipe

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

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ pela equipe do Projeto A3**

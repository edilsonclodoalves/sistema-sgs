# 🏥 SGS – Sistema de Gestão de Saúde (Frontend + Backend) 

Plataforma completa para gerenciamento de serviços de saúde, incluindo API backend, portal web para pacientes e módulos administrativos. Desenvolvido como parte do **Projeto A3 – Gestão de Qualidade de Software (Ecossistema Ânima – LIVE)**.

---

# 📚 **Sumário**

1. [Visão Geral](#visão-geral)  
2. [Arquitetura Geral](#arquitetura-geral)  
3. [Tecnologias](#tecnologias)  
4. [Funcionalidades Principais](#funcionalidades-principais)  
5. [Estrutura dos Projetos](#estrutura-dos-projetos)  
6. [Backend – Guia Completo](#backend--guia-completo)  
7. [Frontend – Guia Completo](#frontend--guia-completo)  
8. [Endpoints Principais](#endpoints-principais)  
9. [Credenciais de Teste](#credenciais-de-teste)  
10. [Qualidade de Software (CMMI + ISO 25010)](#qualidade-de-software)  
11. [Próximas Melhorias](#próximas-melhorias)  
12. [Equipe](#equipe)  
13. [Licença](#licença)

---

# 🎯 **Visão Geral**

O SGS é um sistema completo para:

✔ Agendamento de consultas  
✔ Gestão de pacientes  
✔ Prontuário eletrônico  
✔ Filas de atendimento em tempo real  
✔ Módulo administrativo completo  
✔ Portal do paciente  
✔ API segura com autenticação JWT  

---

# 🏗 **Arquitetura Geral**

```
sgs/
├── backend/        # API RESTful (Node, Express, MySQL)
└── frontend/       # Interface Web (React, Bootstrap)
```

Frontend e backend se comunicam via **REST API + Axios**.

---

# 🛠 **Tecnologias**

### **Backend**
- Node.js 18+
- Express
- Sequelize ORM + MySQL
- JWT + bcrypt
- Jest + Supertest
- Winston Logger

### **Frontend**
- React 18  
- React Router DOM  
- Bootstrap 5  
- React Bootstrap  
- Axios  
- Context API  
- React Toastify  

---

# 🔑 **Funcionalidades Principais**

### **Paciente**
- Login com CPF  
- Agendamento online  
- Histórico médico completo  
- Minhas consultas  
- Perfil do paciente  
- Visualização de filas de atendimento  

### **Administrador**
- Dashboard administrativo  
- Gerenciamento de pacientes  
- Gerenciamento de consultas  
- Gerenciamento de usuários  
- Agendamento administrativo  

### **Ambos**
- Unidades de saúde  
- Design responsivo  
- Segurança baseada em JWT  

---

# 📁 **Estrutura dos Projetos**

## **Backend – Estrutura Completa**

```
backend/
├── coverage/
│   ├── lcov-report/
│   ├── clover.xml
│   ├── coverage-final.json
│   └── lcov.info
├── scripts/
│   └── setup-database.js
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── logger.js
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── ConsultaController.js
│   │   ├── ExameController.js
│   │   ├── MedicoController.js
│   │   ├── PacienteController.js
│   │   ├── PrescricaoController.js
│   │   └── ProntuarioController.js
│   ├── middlewares/
│   │   └── auth.js
│   ├── models/
│   │   ├── Consulta.js
│   │   ├── Exame.js
│   │   ├── Medico.js
│   │   ├── Notificacao.js
│   │   ├── Paciente.js
│   │   ├── Pessoa.js
│   │   ├── Prescricao.js
│   │   ├── Prontuario.js
│   │   └── Usuario.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── consultaRoutes.js
│   │   ├── exameRoutes.js
│   │   ├── medicoRoutes.js
│   │   ├── pacienteRoutes.js
│   │   ├── prescricaoRoutes.js
│   │   └── prontuarioRoutes.js
│   └── tests/
│       └── integration.test.js
├── server.js
├── package.json
└── README.md
```

---

## **Frontend – Estrutura Completa**

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.js
│   ├── components/
│   │   ├── Navigation.js
│   │   └── ProtectedRoute.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── AdminDashboard.js
│   │   ├── AgendarConsultaAdmin.js
│   │   ├── AgendarConsultaPaciente.js
│   │   ├── CadastrarUsuario.js
│   │   ├── Cadastro.js
│   │   ├── EditarPaciente.js
│   │   ├── FilasAtendimento.js
│   │   ├── GerenciarConsultas.js
│   │   ├── GerenciarPacientes.js
│   │   ├── GerenciarUsuarios.js
│   │   ├── HistoricoMedico.js
│   │   ├── Home.js
│   │   ├── LoginPaciente.js
│   │   ├── LoginUsuario.js
│   │   ├── MinhasConsultas.js
│   │   ├── PacienteDashboard.js
│   │   ├── PerfilPaciente.js
│   │   └── UnidadesSaude.js
│   ├── services/
│   │   ├── api.js
│   │   ├── consultaService.js
│   │   └── prontuarioService.js
│   ├── styles/
│   │   └── custom.css
│   ├── utils/
│   ├── index.js
│   └── reportWebVitals.js
├── package.json
└── README.md
```

---

# 🔧 **Backend – Guia Completo**

## **Instalação**

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

## **Testes**

```bash
npm test
npm test -- --coverage
```

Relatório:  
```
coverage/lcov-report/index.html
```

---

# 💻 **Frontend – Guia Completo**

## **Instalação**

```bash
npm install
cp .env.example .env
npm start
```

Acesse: http://localhost:3000

---

# 🔌 **Endpoints Principais**

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/pacientes
POST   /api/pacientes

GET    /api/consultas
POST   /api/consultas
DELETE /api/consultas/:id

GET    /api/medicos
GET    /api/prontuarios/paciente/:id
```

---

# 🧪 **Credenciais de Teste**

| Perfil | Email | Senha |
|--------|--------|--------|
| Admin | admin@sgs.com | admin123 |
| Médico | joao.silva@sgs.com | medico123 |
| Recepção | ana.costa@sgs.com | recep123 |
| Paciente | maria.santos@email.com | paciente123 |

---

# ⭐ **Qualidade de Software**

## **CMMI – REQM**
- Rastreabilidade entre RF, UC, componentes e testes.

## **ISO 25010**
- Usabilidade  
- Segurança  
- Performance  
- Confiabilidade  

---


# 👥 **Equipe**

- Edilson Clodoalves Galvão de Lima  
- Flávio Grego Santiago  
- Marina Mara Velozo  
- Weverton Araujo Martins  

**Orientadores:**  
Prof. Giuliano Richards Ribeiro  
Prof. Otacilio José Pereira  

---

# 📝 **Licença**

Projeto acadêmico – Ecossistema Ânima – LIVE  
Disciplina: Gestão de Qualidade de Software – 2º/2025

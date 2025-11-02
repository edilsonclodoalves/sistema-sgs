# 🏥 SGS - Sistema de Gestão de Saúde v1.0

Sistema completo de gestão para clínicas e consultórios médicos.

## 🚀 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
cp .env.example .env
# Edite o .env com suas credenciais

# 3. Setup do banco de dados
npm run setup

# 4. Iniciar servidor
npm run dev

# 5. Executar testes
npm test
```

## 📦 O que está incluído

✅ **Backend Completo**
- API RESTful com Express
- Autenticação JWT
- Controle de acesso (RBAC)
- ORM Sequelize + MySQL
- Testes automatizados (Jest + Supertest)

✅ **Funcionalidades**
- Gestão de pacientes
- Agendamento de consultas
- Prontuário eletrônico
- Prescrições médicas
- Controle de exames
- Sistema de notificações

✅ **Segurança**
- JWT com expiração
- Senhas hasheadas (bcrypt)
- Rate limiting
- Helmet para headers seguros
- CORS configurável

✅ **Qualidade**
- Testes de integração
- Cobertura de código
- Logs estruturados
- Validações robustas

## 📚 Documentação

Consulte `DOCUMENTACAO-COMPLETA.md` para:
- Arquitetura detalhada
- API Endpoints
- Guias de uso
- Troubleshooting

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm test -- --coverage
```

## 🔑 Credenciais de Teste

Após `npm run setup`:

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@sgs.com | admin123 |
| Médico | joao.silva@sgs.com | medico123 |
| Recepcionista | ana.costa@sgs.com | recep123 |
| Paciente | maria.santos@email.com | paciente123 |

## 📝 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/         # Configurações
│   ├── models/         # Modelos do banco
│   ├── controllers/    # Lógica de negócio
│   ├── routes/         # Rotas da API
│   ├── middlewares/    # Middlewares
│   └── tests/          # Testes
├── scripts/
│   └── setup-database.js
├── server.js
└── package.json
```

## 🌐 Endpoints Principais

```
POST   /api/auth/login
GET    /api/auth/me
GET    /api/pacientes
POST   /api/pacientes
GET    /api/consultas
POST   /api/consultas
```

## 🛠️ Stack Tecnológica

- Node.js 18+
- Express 4.x
- MySQL 8.0+
- Sequelize ORM
- JWT para autenticação
- Jest para testes

## 📧 Suporte

Problemas? Consulte:
1. Logs em `logs/`
2. Execute `npm test`
3. Veja DOCUMENTACAO-COMPLETA.md

---

**Desenvolvido com ❤️ pela Equipe SGS - Novembro 2025**

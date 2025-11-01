# 🚀 GUIA RÁPIDO - Backend API

## Sistema de Gestão de Saúde - Backend

### ⚡ Instalação Rápida

1. **Instale as dependências:**
```bash
cd sistema-saude-backend
npm install
```

2. **Configure o MySQL:**
```sql
CREATE DATABASE sistema_saude;
```

3. **Configure o .env:**
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:
```env
PORT=3001
DB_HOST=localhost
DB_NAME=sistema_saude
DB_USER=root
DB_PASSWORD=sua_senha
JWT_SECRET=seu-secret-aqui
```

4. **Inicie o servidor:**
```bash
npm start
```

### 🎯 Principais Alterações

✅ **Autenticação com CPF**
- Pacientes fazem login com CPF + senha
- Sistema também suporta email + senha

✅ **Modelo Paciente atualizado**
- Adiciona campos: `cep`, `senha`, `ativo`
- CPF usado para autenticação

✅ **Modelo Consulta atualizado**
- Novos campos: `horario`, `tipo`, `especialidade`, `unidade`, `observacoes`, `diagnostico`, `protocolo`
- Status: `agendada`, `confirmada`, `realizada`, `cancelada`

✅ **Endpoints novos:**
- `GET /api/consultas/horarios-disponiveis` - Lista horários disponíveis
- `POST /api/auth/register` - Cadastro de pacientes
- `GET /api/auth/verify` - Verificar token

### 📡 Testando a API

**1. Cadastrar Paciente:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "cpf": "12345678900",
    "data_nascimento": "1990-01-01",
    "telefone": "11999999999",
    "email": "joao@email.com",
    "endereco": "Rua Exemplo, 123",
    "cep": "01234567",
    "senha": "senha123"
  }'
```

**2. Fazer Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678900",
    "senha": "senha123"
  }'
```

**3. Listar Consultas (com token):**
```bash
curl -X GET http://localhost:3001/api/consultas \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 🗂️ Estrutura Principal

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js       ← LOGIN/CADASTRO
│   │   └── consultaController.js   ← UC01
│   ├── models/
│   │   ├── Paciente.js            ← ATUALIZADO
│   │   └── Consulta.js            ← ATUALIZADO
│   ├── routes/
│   │   ├── authRoutes.js          ← ROTAS AUTH
│   │   └── consultaRoutes.js      ← ROTAS CONSULTAS
│   └── middlewares/
│       └── authMiddleware.js      ← VERIFICA JWT
├── .env.example
├── package.json
└── server.js                       ← PORTA 3001
```

### 🔑 Fluxo de Autenticação

1. Paciente se cadastra → Recebe token JWT
2. Token válido por 7 dias
3. Todas as rotas protegidas verificam o token
4. Token contém: id, email, cpf, tipo (paciente)

### 🆘 Problemas Comuns

**Erro de conexão MySQL:**
- Verifique se o MySQL está rodando
- Confirme credenciais no .env
- Verifique se o banco existe

**Token inválido:**
- Verifique se JWT_SECRET está configurado
- Token expira em 7 dias

**Porta 3001 em uso:**
```bash
# Linux/Mac
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID [NUMERO] /F
```

### 📚 Documentação Completa

Consulte o `README.md` para documentação detalhada de todos os endpoints.

---

**Projeto A3 - Gestão de Qualidade de Software**

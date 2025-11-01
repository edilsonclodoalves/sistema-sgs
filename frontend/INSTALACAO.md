# 🚀 GUIA RÁPIDO DE INSTALAÇÃO

## Sistema de Gestão de Saúde - Frontend React

### 📋 Pré-requisitos
- Node.js v14+ instalado
- Backend da API rodando na porta 3001

### ⚡ Instalação Rápida

1. **Abra o terminal na pasta do projeto:**
   ```bash
   cd sistema-saude-frontend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure a API:**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` se necessário:
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. **Inicie o servidor:**
   ```bash
   npm start
   ```

5. **Acesse no navegador:**
   ```
   http://localhost:3000
   ```

### 🔑 Credenciais de Teste

Para testar, crie uma conta no sistema ou use credenciais do backend.

### 📱 Funcionalidades Principais

1. **Login/Cadastro** - Autenticação de usuários
2. **Agendar Consulta** - Sistema completo em 4 etapas
3. **Minhas Consultas** - Gerenciar agendamentos
4. **Histórico Médico** - Visualizar prontuário completo
5. **Filas de Atendimento** - Tempo real de espera
6. **Unidades de Saúde** - Localização e informações

### 🛠️ Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
├── contexts/         # Context API (Auth)
├── pages/            # Páginas da aplicação
├── services/         # Serviços de API
└── styles/           # Estilos customizados
```

### 📚 Documentação Completa

Consulte o arquivo `README.md` para documentação detalhada.

### 🐛 Problemas Comuns

**Porta 3000 em uso:**
```bash
# Linux/Mac
PORT=3001 npm start

# Windows
set PORT=3001 && npm start
```

**Erro de conexão com API:**
- Verifique se o backend está rodando
- Confirme a URL no arquivo `.env`

**Erro ao instalar dependências:**
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### 📞 Suporte

Para dúvidas, consulte a documentação completa no README.md

---

**Projeto A3 - Gestão de Qualidade de Software**
**2º Semestre/2025 - Ecossistema Ânima**

# 🛠️ COMANDOS ÚTEIS E TROUBLESHOOTING

## Sistema de Gestão de Saúde - Frontend React

---

## 📦 Comandos NPM

### Instalação e Execução
```bash
# Instalar todas as dependências
npm install

# Iniciar servidor de desenvolvimento
npm start

# Criar build de produção
npm run build

# Executar testes
npm test

# Ejetar configurações (CUIDADO: irreversível)
npm run eject
```

### Gerenciamento de Dependências
```bash
# Instalar nova dependência
npm install nome-do-pacote

# Instalar dependência de desenvolvimento
npm install --save-dev nome-do-pacote

# Atualizar dependências
npm update

# Verificar dependências desatualizadas
npm outdated

# Limpar cache do npm
npm cache clean --force

# Reinstalar todas as dependências
rm -rf node_modules package-lock.json
npm install
```

---

## 🐛 Troubleshooting Comum

### Problema: Porta 3000 já está em uso

**Solução 1 - Mudar a porta:**
```bash
# Linux/Mac
PORT=3001 npm start

# Windows (CMD)
set PORT=3001 && npm start

# Windows (PowerShell)
$env:PORT=3001; npm start
```

**Solução 2 - Matar o processo na porta:**
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID [NUMERO_DO_PID] /F
```

---

### Problema: Erro ao conectar com a API

**Sintomas:**
- Network Error
- CORS Error
- 404 Not Found

**Soluções:**

1. **Verificar se o backend está rodando:**
```bash
curl http://localhost:3001/api
```

2. **Verificar URL no .env:**
```bash
# Deve estar assim:
REACT_APP_API_URL=http://localhost:3001/api
```

3. **Verificar CORS no backend:**
O backend deve permitir requisições do frontend:
```javascript
// No backend, verificar:
cors({
  origin: 'http://localhost:3000'
})
```

4. **Reiniciar ambos os servidores:**
```bash
# Terminal 1 - Backend
cd clinica-api/backend
npm start

# Terminal 2 - Frontend
cd sistema-saude-frontend
npm start
```

---

### Problema: Dependências não instaladas corretamente

**Sintomas:**
- Module not found
- Cannot find package

**Soluções:**

1. **Limpar e reinstalar:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

2. **Verificar versão do Node:**
```bash
node --version
# Deve ser v14 ou superior
```

3. **Limpar cache do npm:**
```bash
npm cache clean --force
npm install
```

---

### Problema: Build de produção falha

**Sintomas:**
- Build errors
- Out of memory

**Soluções:**

1. **Aumentar memória do Node:**
```bash
# Linux/Mac
NODE_OPTIONS=--max_old_space_size=4096 npm run build

# Windows
set NODE_OPTIONS=--max_old_space_size=4096 && npm run build
```

2. **Verificar erros de sintaxe:**
```bash
npm run build --verbose
```

---

### Problema: Autenticação não funciona

**Sintomas:**
- Login falha
- Token não persiste
- Redirect infinito

**Soluções:**

1. **Limpar localStorage:**
```javascript
// No console do navegador:
localStorage.clear()
```

2. **Verificar token no localStorage:**
```javascript
// No console do navegador:
localStorage.getItem('@SaudeSistema:token')
localStorage.getItem('@SaudeSistema:user')
```

3. **Verificar se o backend está retornando o token:**
```bash
# Teste manual com curl:
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678900","senha":"senha123"}'
```

---

### Problema: Componentes não renderizam

**Sintomas:**
- Tela em branco
- Erros no console

**Soluções:**

1. **Verificar console do navegador:**
Abra as DevTools (F12) e veja os erros

2. **Verificar imports:**
```javascript
// Certifique-se que todos os imports estão corretos
import React from 'react';
import { Container } from 'react-bootstrap';
```

3. **Verificar se todas as dependências estão instaladas:**
```bash
npm install
```

---

## 🔧 Ferramentas de Desenvolvimento

### React DevTools
**Instalação:**
- [Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

**Uso:**
- Inspecionar componentes
- Ver props e state
- Verificar Context
- Analisar performance

### Browser DevTools
**Atalhos úteis:**
- `F12` - Abrir DevTools
- `Ctrl + Shift + C` - Inspecionar elemento
- `Ctrl + Shift + J` - Console JavaScript
- `Ctrl + Shift + I` - DevTools

**Tabs importantes:**
- **Console** - Ver erros e logs
- **Network** - Ver requisições HTTP
- **Application** - Ver localStorage/sessionStorage
- **Elements** - Inspecionar DOM

---

## 📊 Comandos de Análise

### Analisar tamanho do bundle
```bash
npm install --save-dev source-map-explorer
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

### Verificar vulnerabilidades
```bash
npm audit
npm audit fix
```

### Verificar código (ESLint)
```bash
npm run lint
```

---

## 🚀 Deploy

### Build para produção
```bash
npm run build
```

Os arquivos estarão em `build/` prontos para deploy.

### Servir build localmente
```bash
npm install -g serve
serve -s build
```

### Deploy em diferentes plataformas

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

**GitHub Pages:**
```bash
npm install --save-dev gh-pages

# Adicionar no package.json:
"homepage": "https://seu-usuario.github.io/repo-name",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy:
npm run deploy
```

---

## 🔍 Comandos de Debug

### Verificar variáveis de ambiente
```bash
# No código React:
console.log(process.env.REACT_APP_API_URL)
```

### Debug de requisições HTTP
```javascript
// Em src/services/api.js, adicionar:
api.interceptors.request.use(request => {
  console.log('Starting Request', request)
  return request
})

api.interceptors.response.use(response => {
  console.log('Response:', response)
  return response
})
```

### Verificar re-renders desnecessários
```bash
npm install --save-dev why-did-you-render

# Adicionar em src/index.js:
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React);
}
```

---

## 📱 Testes Mobile

### Testar em dispositivo móvel local
```bash
# Descobrir seu IP local
# Linux/Mac:
ifconfig | grep "inet "

# Windows:
ipconfig

# Acessar no celular:
http://SEU_IP:3000
```

---

## 🆘 Links Úteis

### Documentação
- [React Docs](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Bootstrap](https://getbootstrap.com/)
- [React Bootstrap](https://react-bootstrap.github.io/)
- [Axios](https://axios-http.com/)

### Ferramentas
- [Can I Use](https://caniuse.com/) - Compatibilidade de browsers
- [Bundle Phobia](https://bundlephobia.com/) - Tamanho de pacotes npm
- [npm trends](https://npmtrends.com/) - Comparar pacotes npm

---

## 💡 Dicas de Performance

### 1. Lazy Loading de Rotas
```javascript
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));

<Suspense fallback={<div>Loading...</div>}>
  <Home />
</Suspense>
```

### 2. Memoização de Componentes
```javascript
import { memo } from 'react';

const Component = memo(({ data }) => {
  return <div>{data}</div>;
});
```

### 3. useMemo e useCallback
```javascript
import { useMemo, useCallback } from 'react';

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const handleClick = useCallback(() => {
  doSomething();
}, []);
```

---

## 🎓 Recursos de Aprendizado

### Tutoriais Recomendados
1. [React Official Tutorial](https://react.dev/learn)
2. [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
3. [Bootstrap Documentation](https://getbootstrap.com/docs/)

### Comunidades
- [Stack Overflow](https://stackoverflow.com/questions/tagged/reactjs)
- [Reddit r/reactjs](https://reddit.com/r/reactjs)
- [Discord Reactiflux](https://www.reactiflux.com/)

---

## ✅ Checklist de Deploy

Antes de fazer deploy para produção:

- [ ] Remover console.logs
- [ ] Atualizar variáveis de ambiente (.env)
- [ ] Testar build de produção localmente
- [ ] Verificar todas as rotas
- [ ] Testar em diferentes navegadores
- [ ] Testar responsividade mobile
- [ ] Verificar performance (Lighthouse)
- [ ] Verificar acessibilidade
- [ ] Testar integração com backend em produção
- [ ] Configurar HTTPS
- [ ] Configurar domínio customizado

---

**Para mais ajuda, consulte o README.md ou entre em contato com a equipe.**

---

**Projeto A3 - Gestão de Qualidade de Software**
**2º Semestre/2025**

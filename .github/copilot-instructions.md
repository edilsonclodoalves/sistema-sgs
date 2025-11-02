# AI Agent Instructions for SGS (Sistema de Gestão de Saúde)

## Project Overview
SGS is a healthcare management system with a Node.js/Express backend and React frontend. The system manages patient appointments, medical records, prescriptions, and notifications.

## Architecture

### Backend (`/backend`)
- **Models**: Uses Sequelize ORM with a hierarchical structure:
  - `Pessoa` is the base model for all users
  - `Usuario`, `Paciente`, and `Medico` extend from `Pessoa`
  - See `models/index.js` for relationship definitions
- **Controllers**: Follow RESTful patterns with authentication checks
- **Routes**: Mounted in `server.js`, follow pattern: `/api/v1/{resource}`
- **Authentication**: JWT-based (see `middlewares/auth.js`)

### Frontend (`/frontend`)
- Built with React 18.2.0 + Bootstrap 5.3.2
- State management using Context API (`contexts/AuthContext.js`)
- Page components in `pages/` follow naming pattern: `{Feature}.js`
- API calls centralized in `services/` directory

## Development Workflow

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment
npm run setup         # Initialize database
npm run dev          # Start development server
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Testing
- Backend uses Jest + Supertest
- Run tests: `cd backend && npm test`
- Tests in `src/tests/integration.test.js`

## Key Patterns

### API Endpoints
- All routes require authentication except `/auth/login` and `/auth/register`
- Use JWT token in Authorization header: `Bearer {token}`

### Error Handling
- Backend: HTTP status codes + JSON response with `{success, message, data?}`
- Frontend: Axios interceptors in `services/api.js` handle global error states

### Database Relationships
Follow the model hierarchy:
```
Pessoa
├── Usuario
├── Paciente (has many Consultas)
└── Medico (has many Consultas)
```

## Common Pitfalls
- Remember to update both `Pessoa` and specific role (Paciente/Medico) when updating user data
- Always use transaction blocks for operations affecting multiple models
- Frontend routes require AuthContext verification for protected paths
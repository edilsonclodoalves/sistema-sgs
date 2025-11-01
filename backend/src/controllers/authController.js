const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Usuario, Paciente } = require('../models');
require('dotenv').config();

// Função para gerar token JWT
const generateToken = (user, type) => {
  return jwt.sign(
    { 
      id: type === 'paciente' ? user.id_paciente : user.id_usuario, 
      email: user.email,
      cpf: user.cpf,
      tipo: type,
      role: user.role || 'paciente'
    },
    process.env.JWT_SECRET || 'seu-secret-muito-seguro',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Controller de autenticação
const authController = {
  // Login de paciente com CPF
  login: async (req, res) => {
    try {
      const { cpf, senha, email } = req.body;

      // Validar dados de entrada
      if ((!cpf && !email) || !senha) {
        return res.status(400).json({
          error: 'CPF/Email e senha são obrigatórios'
        });
      }

      let usuario = null;
      let tipo = null;

      // Tentar login como paciente com CPF
      if (cpf) {
        const cpfLimpo = cpf.replace(/\D/g, '');
        usuario = await Paciente.findOne({ where: { cpf: cpfLimpo } });
        tipo = 'paciente';
      }

      // Se não encontrou paciente, tentar login como usuário do sistema
      if (!usuario && email) {
        usuario = await Usuario.findOne({ where: { email } });
        tipo = 'usuario';
      }

      // Verificar se o usuário existe
      if (!usuario) {
        return res.status(401).json({
          error: 'Credenciais inválidas'
        });
      }

      // Verificar senha
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        return res.status(401).json({
          error: 'Credenciais inválidas'
        });
      }

      // Gerar token JWT
      const token = generateToken(usuario, tipo);

      // Retornar dados do usuário e token
      return res.status(200).json({
        message: 'Login realizado com sucesso',
        token,
        usuario: {
          id: tipo === 'paciente' ? usuario.id_paciente : usuario.id_usuario,
          nome: usuario.nome,
          email: usuario.email,
          cpf: usuario.cpf,
          tipo: tipo,
          role: usuario.role || 'paciente'
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Registro de novo paciente
  register: async (req, res) => {
    try {
      const { nome, cpf, data_nascimento, telefone, email, endereco, cep, senha } = req.body;

      // Validar dados de entrada
      if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({
          error: 'Todos os campos obrigatórios devem ser preenchidos'
        });
      }

      // Limpar CPF
      const cpfLimpo = cpf.replace(/\D/g, '');

      // Verificar se o CPF já está em uso
      const cpfExistente = await Paciente.findOne({ where: { cpf: cpfLimpo } });
      if (cpfExistente) {
        return res.status(409).json({
          error: 'CPF já está cadastrado'
        });
      }

      // Verificar se o email já está em uso
      const emailExistente = await Paciente.findOne({ where: { email } });
      if (emailExistente) {
        return res.status(409).json({
          error: 'Email já está em uso'
        });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Criar novo paciente
      const novoPaciente = await Paciente.create({
        nome,
        cpf: cpfLimpo,
        data_nascimento,
        telefone: telefone.replace(/\D/g, ''),
        email,
        endereco,
        cep: cep ? cep.replace(/\D/g, '') : null,
        senha: senhaHash,
        ativo: true
      });

      // Gerar token JWT
      const token = generateToken(novoPaciente, 'paciente');

      // Retornar dados do paciente e token
      return res.status(201).json({
        message: 'Cadastro realizado com sucesso',
        token,
        usuario: {
          id: novoPaciente.id_paciente,
          nome: novoPaciente.nome,
          email: novoPaciente.email,
          cpf: novoPaciente.cpf,
          tipo: 'paciente'
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Verificar token
  verifyToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          error: 'Token não fornecido'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu-secret-muito-seguro');
      
      return res.status(200).json({
        valid: true,
        usuario: decoded
      });
    } catch (error) {
      return res.status(401).json({
        error: 'Token inválido',
        valid: false
      });
    }
  }
};

module.exports = authController;


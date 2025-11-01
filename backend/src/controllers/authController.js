const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
require('dotenv').config();

// Função para gerar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id_usuario, 
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Controller de autenticação
const authController = {
  // Login de usuário
  login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      // Validar dados de entrada
      if (!email || !senha) {
        return res.status(400).json({
          status: 'error',
          message: 'Email e senha são obrigatórios'
        });
      }

      // Buscar usuário pelo email
      const usuario = await Usuario.findOne({ where: { email } });

      // Verificar se o usuário existe
      if (!usuario) {
        return res.status(401).json({
          status: 'error',
          message: 'Credenciais inválidas'
        });
      }

      // Verificar senha
      const senhaCorreta = await usuario.checkPassword(senha);
      if (!senhaCorreta) {
        return res.status(401).json({
          status: 'error',
          message: 'Credenciais inválidas'
        });
      }

      // Gerar token JWT
      const token = generateToken(usuario);

      // Retornar dados do usuário e token
      return res.status(200).json({
        status: 'success',
        message: 'Login realizado com sucesso',
        data: {
          usuario: {
            id: usuario.id_usuario,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Registro de novo usuário
  register: async (req, res) => {
    try {
      const { nome, email, senha, role } = req.body;

      // Validar dados de entrada
      if (!nome || !email || !senha) {
        return res.status(400).json({
          status: 'error',
          message: 'Nome, email e senha são obrigatórios'
        });
      }

      // Verificar se o email já está em uso
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(409).json({
          status: 'error',
          message: 'Email já está em uso'
        });
      }

      // Criar novo usuário
      const novoUsuario = await Usuario.create({
        nome,
        email,
        senha,
        role: role || 'recepcionista' // Papel padrão
      });

      // Gerar token JWT
      const token = generateToken(novoUsuario);

      // Retornar dados do usuário e token
      return res.status(201).json({
        status: 'success',
        message: 'Usuário registrado com sucesso',
        data: {
          usuario: {
            id: novoUsuario.id_usuario,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            role: novoUsuario.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = authController;


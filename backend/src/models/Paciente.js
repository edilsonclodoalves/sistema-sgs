const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Paciente = sequelize.define('Paciente', {
  id_paciente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [11, 14]
    }
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  endereco: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cep: {
    type: DataTypes.STRING(9),
    allowNull: true
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'pacientes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Paciente;


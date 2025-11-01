const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Medico = sequelize.define('Medico', {
  id_medico: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  crm: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  especialidade: {
    type: DataTypes.STRING,
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
  }
}, {
  tableName: 'medicos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Medico;


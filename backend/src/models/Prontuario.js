const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Paciente = require('./Paciente');

const Prontuario = sequelize.define('Prontuario', {
  id_prontuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Paciente,
      key: 'id_paciente'
    }
  },
  data_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  diagnostico: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'prontuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Definir as associações
Prontuario.belongsTo(Paciente, { foreignKey: 'id_paciente' });
Paciente.hasMany(Prontuario, { foreignKey: 'id_paciente' });

module.exports = Prontuario;


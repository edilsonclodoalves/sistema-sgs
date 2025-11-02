const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Exame extends Model {}

Exame.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  paciente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pacientes',
      key: 'id'
    }
  },
  medico_solicitante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'medicos',
      key: 'id'
    }
  },
  tipo_exame: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  data_solicitacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  data_realizacao: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resultado: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  arquivo_resultado: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('SOLICITADO', 'AGENDADO', 'REALIZADO', 'CANCELADO'),
    defaultValue: 'SOLICITADO'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Exame',
  tableName: 'exames',
  timestamps: true
});

module.exports = Exame;

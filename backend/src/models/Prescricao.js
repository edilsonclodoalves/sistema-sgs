const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Prescricao extends Model {}

Prescricao.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  prontuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'prontuarios',
      key: 'id'
    }
  },
  paciente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pacientes',
      key: 'id'
    }
  },
  medico_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'medicos',
      key: 'id'
    }
  },
  medicamento: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  dosagem: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  via_administracao: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  frequencia: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  duracao: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Prescricao',
  tableName: 'prescricoes',
  timestamps: true
});

module.exports = Prescricao;
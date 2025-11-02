const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Prontuario extends Model {}

Prontuario.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  consulta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'consultas',
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
  queixa_principal: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  historia_doenca: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  exame_fisico: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  diagnostico: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cid: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  conduta: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Prontuario',
  tableName: 'prontuarios',
  timestamps: true
});

module.exports = Prontuario;

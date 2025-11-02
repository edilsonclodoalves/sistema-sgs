const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Consulta extends Model {}

Consulta.init({
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
  medico_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'medicos',
      key: 'id'
    }
  },
  data_hora: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duracao_minutos: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  tipo: {
    type: DataTypes.ENUM('CONSULTA', 'RETORNO', 'EXAME'),
    defaultValue: 'CONSULTA'
  },
  status: {
    type: DataTypes.ENUM('AGENDADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA', 'FALTA'),
    defaultValue: 'AGENDADA'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  motivo_cancelamento: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Consulta',
  tableName: 'consultas',
  timestamps: true
});

module.exports = Consulta;

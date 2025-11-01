const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Paciente = require('./Paciente');
const Consulta = require('./Consulta');

const Prescricao = sequelize.define('Prescricao', {
  id_prescricao: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_consulta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Consulta,
      key: 'id_consulta'
    }
  },
  id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Paciente,
      key: 'id_paciente'
    }
  },
  medicamento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dosagem: {
    type: DataTypes.STRING,
    allowNull: false
  },
  instrucoes: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data_prescricao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'prescricoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Definir as associações
Prescricao.belongsTo(Paciente, { foreignKey: 'id_paciente' });
Prescricao.belongsTo(Consulta, { foreignKey: 'id_consulta' });
Paciente.hasMany(Prescricao, { foreignKey: 'id_paciente' });
Consulta.hasMany(Prescricao, { foreignKey: 'id_consulta' });

module.exports = Prescricao;


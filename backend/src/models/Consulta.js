const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Paciente = require('./Paciente');
const Medico = require('./Medico');

//Campos da tabela do banco de dados
const Consulta = sequelize.define('Consulta', {
  id_consulta: {
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
  id_medico: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Medico,
      key: 'id_medico'
    }
  },
  data_consulta: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Agendada', 'Realizada', 'Cancelada'),
    allowNull: false,
    defaultValue: 'Agendada'
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'consultas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Definir as associações
Consulta.belongsTo(Paciente, { foreignKey: 'id_paciente' });
Consulta.belongsTo(Medico, { foreignKey: 'id_medico' });
Paciente.hasMany(Consulta, { foreignKey: 'id_paciente' });
Medico.hasMany(Consulta, { foreignKey: 'id_medico' });

module.exports = Consulta;


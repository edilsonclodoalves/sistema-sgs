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
  horario: {
    type: DataTypes.STRING(5),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('primeira_consulta', 'retorno', 'emergencia'),
    allowNull: false,
    defaultValue: 'primeira_consulta'
  },
  especialidade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unidade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('agendada', 'confirmada', 'realizada', 'cancelada'),
    allowNull: false,
    defaultValue: 'agendada'
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  diagnostico: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  protocolo: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
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


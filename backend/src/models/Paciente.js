const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Paciente extends Model {}

Paciente.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pessoa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'pessoas',
      key: 'id'
    }
  },
  numero_prontuario: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true
  },
  tipo_sanguineo: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true
  },
  alergias: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  medicamentos_uso: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  convenio: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  numero_carteirinha: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Paciente',
  tableName: 'pacientes',
  timestamps: true
});

module.exports = Paciente;

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Medico extends Model {}

Medico.init({
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
  crm: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  crm_uf: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  especialidade: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  especialidades_secundarias: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  valor_consulta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Medico',
  tableName: 'medicos',
  timestamps: true
});

module.exports = Medico;

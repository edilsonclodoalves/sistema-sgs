const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Paciente = require('./Paciente');
const Consulta = require('./Consulta');

const Exame = sequelize.define('Exame', {
  id_exame: {
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
  tipo_exame: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data_solicitacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  resultado: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Solicitado', 'Em Andamento', 'Concluído'),
    allowNull: false,
    defaultValue: 'Solicitado'
  }
}, {
  tableName: 'exames',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Definir as associações
Exame.belongsTo(Paciente, { foreignKey: 'id_paciente' });
Exame.belongsTo(Consulta, { foreignKey: 'id_consulta' });
Paciente.hasMany(Exame, { foreignKey: 'id_paciente' });
Consulta.hasMany(Exame, { foreignKey: 'id_consulta' });

module.exports = Exame;


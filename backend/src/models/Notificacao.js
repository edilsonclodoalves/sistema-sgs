const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Notificacao extends Model {}

Notificacao.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  mensagem: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('INFO', 'ALERTA', 'URGENTE'),
    defaultValue: 'INFO'
  },
  lida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data_leitura: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Notificacao',
  tableName: 'notificacoes',
  timestamps: true
});

module.exports = Notificacao;

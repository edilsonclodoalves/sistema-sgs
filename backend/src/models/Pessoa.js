const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Pessoa extends Model {}

Pessoa.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cpf: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true,
    validate: {
      len: [11, 11],
      isNumeric: true
    }
  },
  nome_completo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  sexo: {
    type: DataTypes.ENUM('M', 'F', 'Outro'),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  celular: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  cep: {
    type: DataTypes.STRING(8),
    allowNull: true
  },
  logradouro: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  numero: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  complemento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bairro: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  foto_perfil: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Pessoa',
  tableName: 'pessoas',
  timestamps: true
});

module.exports = Pessoa;

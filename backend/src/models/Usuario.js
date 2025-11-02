const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs'); // ✅ CORRIGIDO: era 'bcrypt', agora é 'bcryptjs'
const sequelize = require('../config/database');

class Usuario extends Model {
  async validarSenha(senha) {
    return await bcrypt.compare(senha, this.senha);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.senha;
    return values;
  }
}

Usuario.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pessoa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pessoas',
      key: 'id'
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  perfil: {
    type: DataTypes.ENUM('ADMINISTRADOR', 'GESTOR', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'),
    allowNull: false,
    defaultValue: 'PACIENTE'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ultimo_acesso: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tentativas_login: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bloqueado_ate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Usuario',
  tableName: 'usuarios',
  timestamps: true,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.senha) {
        usuario.senha = await bcrypt.hash(usuario.senha, 10);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('senha')) {
        usuario.senha = await bcrypt.hash(usuario.senha, 10);
      }
    }
  }
});

module.exports = Usuario;

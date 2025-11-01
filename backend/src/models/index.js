const { sequelize } = require('../config/database');
const Paciente = require('./Paciente');
const Medico = require('./Medico');
const Consulta = require('./Consulta');
const Prontuario = require('./Prontuario');
const Exame = require('./Exame');
const Prescricao = require('./Prescricao');
const Usuario = require('./Usuario');

// As associações já foram definidas em cada modelo
// Aqui podemos adicionar associações adicionais se necessário

// Função para sincronizar todos os modelos com o banco de dados
const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Modelos sincronizados com o banco de dados.');
  } catch (error) {
    console.error('Erro ao sincronizar modelos:', error);
  }
};

module.exports = {
  sequelize,
  Paciente,
  Medico,
  Consulta,
  Prontuario,
  Exame,
  Prescricao,
  Usuario,
  syncModels
};


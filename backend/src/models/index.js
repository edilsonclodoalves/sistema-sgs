const sequelize = require('../config/database');
const Pessoa = require('./Pessoa');
const Usuario = require('./Usuario');
const Paciente = require('./Paciente');
const Medico = require('./Medico');
const Consulta = require('./Consulta');
const Prontuario = require('./Prontuario');
const Prescricao = require('./Prescricao');
const Exame = require('./Exame');
const Notificacao = require('./Notificacao');

// Relacionamentos
Pessoa.hasOne(Usuario, { foreignKey: 'pessoa_id', as: 'usuario' });
Usuario.belongsTo(Pessoa, { foreignKey: 'pessoa_id', as: 'pessoa' });

Pessoa.hasOne(Paciente, { foreignKey: 'pessoa_id', as: 'paciente' });
Paciente.belongsTo(Pessoa, { foreignKey: 'pessoa_id', as: 'pessoa' });

Pessoa.hasOne(Medico, { foreignKey: 'pessoa_id', as: 'medico' });
Medico.belongsTo(Pessoa, { foreignKey: 'pessoa_id', as: 'pessoa' });

Paciente.hasMany(Consulta, { foreignKey: 'paciente_id', as: 'consultas' });
Consulta.belongsTo(Paciente, { foreignKey: 'paciente_id', as: 'paciente' });

Medico.hasMany(Consulta, { foreignKey: 'medico_id', as: 'consultas' });
Consulta.belongsTo(Medico, { foreignKey: 'medico_id', as: 'medico' });

Consulta.hasOne(Prontuario, { foreignKey: 'consulta_id', as: 'prontuario' });
Prontuario.belongsTo(Consulta, { foreignKey: 'consulta_id', as: 'consulta' });

Paciente.hasMany(Prontuario, { foreignKey: 'paciente_id', as: 'prontuarios' });
Prontuario.belongsTo(Paciente, { foreignKey: 'paciente_id', as: 'paciente' });

Medico.hasMany(Prontuario, { foreignKey: 'medico_id', as: 'prontuarios' });
Prontuario.belongsTo(Medico, { foreignKey: 'medico_id', as: 'medico' });

Prontuario.hasMany(Prescricao, { foreignKey: 'prontuario_id', as: 'prescricoes' });
Prescricao.belongsTo(Prontuario, { foreignKey: 'prontuario_id', as: 'prontuario' });

// Relacionamentos Paciente <-> Prescricao
Paciente.hasMany(Prescricao, { foreignKey: 'paciente_id', as: 'prescricoes' });
Prescricao.belongsTo(Paciente, { foreignKey: 'paciente_id', as: 'paciente' });

// Relacionamentos Medico <-> Prescricao
Medico.hasMany(Prescricao, { foreignKey: 'medico_id', as: 'prescricoes' });
Prescricao.belongsTo(Medico, { foreignKey: 'medico_id', as: 'medico' });

Paciente.hasMany(Exame, { foreignKey: 'paciente_id', as: 'exames' });
Exame.belongsTo(Paciente, { foreignKey: 'paciente_id', as: 'paciente' });

Medico.hasMany(Exame, { foreignKey: 'medico_solicitante_id', as: 'exames_solicitados' });
Exame.belongsTo(Medico, { foreignKey: 'medico_solicitante_id', as: 'medico_solicitante' });

Usuario.hasMany(Notificacao, { foreignKey: 'usuario_id', as: 'notificacoes' });
Notificacao.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = {
  sequelize,
  Pessoa,
  Usuario,
  Paciente,
  Medico,
  Consulta,
  Prontuario,
  Prescricao,
  Exame,
  Notificacao
};
const { successEmbed, errorEmbed } = require('../../utils/embed');
const User = require('../../models/User');

module.exports = {
  name: 'resetxp',
  description: 'Réinitialiser l\'XP d\'un membre ou de tout le serveur',
  usage: '+resetxp [@membre | all]',
  category: 'admin',
  requiresDb: true,
  permissions: ['Administrator'],
  cooldown: 10,

  async execute(message, args, client) {
    const sub = args[0]?.toLowerCase();

    if (sub === 'all' || sub === 'tous') {
      await User.updateMany({ guildId: message.guild.id }, {
        'levels.xp': 0, 'levels.level': 0, 'levels.totalXp': 0, 'levels.messages': 0
      });
      return message.reply({ embeds: [successEmbed('XP réinitialisé', 'Tout le XP du serveur a été remis à zéro.')] });
    }

    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un membre ou utilise `all`.')] });

    await User.findOneAndUpdate({ userId: target.id, guildId: message.guild.id }, {
      'levels.xp': 0, 'levels.level': 0, 'levels.totalXp': 0, 'levels.messages': 0
    });

    message.reply({ embeds: [successEmbed('XP réinitialisé', `L'XP de **${target.tag}** a été réinitialisé.`)] });
  },
};

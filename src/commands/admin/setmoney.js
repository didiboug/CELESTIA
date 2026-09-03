const { successEmbed, errorEmbed } = require('../../utils/embed');
const User = require('../../models/User');

module.exports = {
  name: 'setmoney',
  aliases: ['setargent'],
  description: 'Définir l\'argent d\'un membre (admin)',
  usage: '+setmoney @membre <montant>',
  category: 'admin',
  requiresDb: true,
  permissions: ['Administrator'],
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!target) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un membre.')] });
    if (isNaN(amount) || amount < 0) return message.reply({ embeds: [errorEmbed('Erreur', 'Indique un montant valide.')] });

    await User.findOneAndUpdate(
      { userId: target.id, guildId: message.guild.id },
      { 'economy.wallet': amount },
      { upsert: true }
    );

    message.reply({ embeds: [successEmbed('Argent défini', `Le portefeuille de **${target.tag}** a été défini à **${amount.toLocaleString('fr-FR')} 💵**.`)] });
  },
};

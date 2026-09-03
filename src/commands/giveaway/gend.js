const { successEmbed, errorEmbed } = require('../../utils/embed');
const Giveaway = require('../../models/Giveaway');
const { endGiveaway } = require('../../utils/giveawayScheduler');

module.exports = {
  name: 'gend',
  description: 'Terminer un giveaway immédiatement',
  usage: '+gend <messageId>',
  category: 'giveaway',
  requiresDb: true,
  permissions: ['ManageGuild'],
  cooldown: 5,

  async execute(message, args, client) {
    const messageId = args[0];
    if (!messageId) return message.reply({ embeds: [errorEmbed('Erreur', 'Précise l\'ID du message du giveaway.')] });

    const giveaway = await Giveaway.findOne({ messageId, guildId: message.guild.id });
    if (!giveaway) return message.reply({ embeds: [errorEmbed('Introuvable', 'Aucun giveaway trouvé avec cet ID.')] });
    if (giveaway.ended) return message.reply({ embeds: [errorEmbed('Erreur', 'Ce giveaway est déjà terminé.')] });

    giveaway.endsAt = new Date();
    await giveaway.save();
    await endGiveaway(client, giveaway);

    message.reply({ embeds: [successEmbed('Giveaway terminé', `Le giveaway **${giveaway.prize}** a été terminé manuellement.`)] });
  },
};

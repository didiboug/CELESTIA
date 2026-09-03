const { successEmbed, errorEmbed } = require('../../utils/embed');
const Giveaway = require('../../models/Giveaway');

module.exports = {
  name: 'greroll',
  aliases: ['reroll'],
  description: 'Retirer un nouveau gagnant pour un giveaway terminé',
  usage: '+greroll <messageId>',
  category: 'giveaway',
  requiresDb: true,
  permissions: ['ManageGuild'],
  cooldown: 5,

  async execute(message, args, client) {
    const messageId = args[0];
    if (!messageId) return message.reply({ embeds: [errorEmbed('Erreur', 'Précise l\'ID du message du giveaway.')] });

    const giveaway = await Giveaway.findOne({ messageId, guildId: message.guild.id });
    if (!giveaway) return message.reply({ embeds: [errorEmbed('Introuvable', 'Aucun giveaway trouvé avec cet ID.')] });
    if (!giveaway.ended) return message.reply({ embeds: [errorEmbed('Erreur', 'Ce giveaway n\'est pas encore terminé.')] });

    const participants = giveaway.participants.filter(id => !giveaway.winnerIds.includes(id));
    if (participants.length === 0) {
      return message.reply({ embeds: [errorEmbed('Impossible', 'Il n\'y a pas d\'autres participants éligibles pour un reroll.')] });
    }

    const newWinner = participants[Math.floor(Math.random() * participants.length)];
    await message.channel.send(`🎉 Le nouveau gagnant du giveaway **${giveaway.prize}** est <@${newWinner}> ! Félicitations !`);
    message.reply({ embeds: [successEmbed('Reroll effectué !', `Nouveau gagnant : <@${newWinner}>`)] });
  },
};

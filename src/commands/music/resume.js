const { successEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'resume',
  aliases: ['reprendre'],
  description: 'Reprendre la musique en pause',
  usage: '+resume',
  category: 'music',
  cooldown: 3,

  async execute(message, args, client) {
    const queue = client.distube?.getQueue(message.guild.id);
    if (!queue) return message.reply({ embeds: [errorEmbed('Erreur', 'Aucune musique en cours.')] });

    if (!queue.paused) return message.reply({ embeds: [errorEmbed('Erreur', 'La musique n\'est pas en pause.')] });

    queue.resume();
    message.reply({ embeds: [successEmbed('Reprise ▶️', `**${queue.songs[0].name}** reprend.`)] });
  },
};

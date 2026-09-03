const { successEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'skip',
  aliases: ['s', 'next'],
  description: 'Passer à la musique suivante',
  usage: '+skip',
  category: 'music',
  cooldown: 3,

  async execute(message, args, client) {
    const queue = client.distube?.getQueue(message.guild.id);
    if (!queue) return message.reply({ embeds: [errorEmbed('Erreur', 'Aucune musique en cours.')] });
    if (!message.member.voice.channel) return message.reply({ embeds: [errorEmbed('Erreur', 'Tu dois être dans le canal vocal.')] });

    try {
      await queue.skip();
      message.reply({ embeds: [successEmbed('Skippé', 'Passé à la musique suivante ⏭️')] });
    } catch {
      message.reply({ embeds: [errorEmbed('Erreur', 'Impossible de passer la musique (c\'est peut-être la dernière).')] });
    }
  },
};

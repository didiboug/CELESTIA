const { successEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'volume',
  aliases: ['vol'],
  description: 'Régler le volume de la musique (0-100)',
  usage: '+volume <0-100>',
  category: 'music',
  cooldown: 3,

  async execute(message, args, client) {
    const queue = client.distube?.getQueue(message.guild.id);
    if (!queue) return message.reply({ embeds: [errorEmbed('Erreur', 'Aucune musique en cours.')] });

    const vol = parseInt(args[0]);
    if (isNaN(vol) || vol < 0 || vol > 100) {
      return message.reply({ embeds: [errorEmbed('Erreur', `Volume actuel : **${queue.volume}%**\nIndique un volume entre 0 et 100.`)] });
    }

    queue.setVolume(vol);
    const emoji = vol === 0 ? '🔇' : vol < 30 ? '🔈' : vol < 70 ? '🔉' : '🔊';
    message.reply({ embeds: [successEmbed('Volume', `${emoji} Volume réglé à **${vol}%**`)] });
  },
};

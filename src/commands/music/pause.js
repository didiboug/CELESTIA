const { successEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'pause',
  description: 'Mettre en pause la musique',
  usage: '+pause',
  category: 'music',
  cooldown: 3,

  async execute(message, args, client) {
    const queue = client.distube?.getQueue(message.guild.id);
    if (!queue) return message.reply({ embeds: [errorEmbed('Erreur', 'Aucune musique en cours.')] });

    if (queue.paused) return message.reply({ embeds: [errorEmbed('Erreur', 'La musique est déjà en pause. Utilise `+resume`.')] });

    queue.pause();
    message.reply({ embeds: [successEmbed('En pause ⏸️', `**${queue.songs[0].name}** est en pause.`)] });
  },
};

const { successEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'stop',
  aliases: ['dc', 'disconnect'],
  description: 'Arrêter la musique et quitter le canal vocal',
  usage: '+stop',
  category: 'music',
  cooldown: 3,

  async execute(message, args, client) {
    const queue = client.distube?.getQueue(message.guild.id);
    if (!queue) return message.reply({ embeds: [errorEmbed('Erreur', 'Aucune musique en cours.')] });
    if (!message.member.voice.channel) return message.reply({ embeds: [errorEmbed('Erreur', 'Tu dois être dans le canal vocal.')] });

    await queue.stop();
    message.reply({ embeds: [successEmbed('Arrêté', 'Musique arrêtée et canal vocal quitté. 👋')] });
  },
};

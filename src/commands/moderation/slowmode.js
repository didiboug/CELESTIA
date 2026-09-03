const { successEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'slowmode',
  aliases: ['slow'],
  description: 'Définir le mode lent d\'un canal',
  usage: '+slowmode <secondes 0-21600> [#canal]',
  category: 'moderation',
  permissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 5,

  async execute(message, args, client) {
    const seconds = parseInt(args[0]);
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return message.reply({ embeds: [errorEmbed('Erreur', 'Indique un délai entre 0 et 21600 secondes (6h).')] });
    }

    const channel = message.mentions.channels.first() || message.channel;
    await channel.setRateLimitPerUser(seconds);

    if (seconds === 0) {
      message.reply({ embeds: [successEmbed('Slowmode Désactivé', `Le mode lent de ${channel} a été désactivé.`)] });
    } else {
      message.reply({ embeds: [successEmbed('Slowmode Activé', `Le mode lent de ${channel} est défini à **${seconds}s**.`)] });
    }
  },
};

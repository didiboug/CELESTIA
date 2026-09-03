const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');

const GIF_URLS = [
  'https://media.tenor.com/images/27051eefd0e18d2f6a2e2e4c51d10f91/tenor.gif',
  'https://media.tenor.com/images/0a1e0a36dd51f4af64c2e14a4c1a50c4/tenor.gif',
];

module.exports = {
  name: 'slap',
  aliases: ['gifle'],
  description: 'Gifler un membre',
  usage: '+slap @membre',
  category: 'fun',
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne quelqu\'un !')] });

    const gif = GIF_URLS[Math.floor(Math.random() * GIF_URLS.length)];

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setDescription(`👋 **${message.author.tag}** gifle **${target.tag}** ! Aïe !`)
      .setImage(gif)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

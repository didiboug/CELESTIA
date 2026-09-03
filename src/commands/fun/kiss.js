const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');

const GIF_URLS = [
  'https://media.tenor.com/images/00e5e29b4c01c3e7be2cd847de3b5f11/tenor.gif',
  'https://media.tenor.com/images/16039e8a064f76e82bcdcc7e3cf58a2a/tenor.gif',
];

module.exports = {
  name: 'kiss',
  aliases: ['bisou'],
  description: 'Embrasser un membre',
  usage: '+kiss @membre',
  category: 'fun',
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne quelqu\'un !')] });
    if (target.id === message.author.id) return message.reply({ embeds: [errorEmbed('Erreur', 'Tu ne peux pas t\'embrasser toi-même 😂')] });

    const gif = GIF_URLS[Math.floor(Math.random() * GIF_URLS.length)];

    const embed = new EmbedBuilder()
      .setColor('#FF73FA')
      .setDescription(`💋 **${message.author.tag}** embrasse **${target.tag}** !`)
      .setImage(gif)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

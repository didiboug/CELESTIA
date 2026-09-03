const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');

const GIF_URLS = [
  'https://media.tenor.com/images/39b48b3db40b5d0f5c21c17f8f8a50da/tenor.gif',
  'https://media.tenor.com/images/2b3a04e22eb71ae36e06cd3b5c81e1bc/tenor.gif',
  'https://media.tenor.com/images/f7f8c6c4ec68c2ab7f1f7af4ff5d84e3/tenor.gif',
];

module.exports = {
  name: 'hug',
  aliases: ['calin'],
  description: 'Faire un câlin à un membre',
  usage: '+hug @membre',
  category: 'fun',
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne quelqu\'un à câliner !')] });

    const gif = GIF_URLS[Math.floor(Math.random() * GIF_URLS.length)];

    const embed = new EmbedBuilder()
      .setColor('#FF73FA')
      .setDescription(`🤗 **${message.author.tag}** fait un câlin à **${target.tag}** !`)
      .setImage(gif)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

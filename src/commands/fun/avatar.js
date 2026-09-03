const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  aliases: ['av', 'pfp'],
  description: 'Voir l\'avatar d\'un membre',
  usage: '+avatar [@membre]',
  category: 'fun',
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.users.first()
      || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null)
      || message.author;

    const formats = ['webp', 'png', 'jpg'];
    const links = formats.map(f => `[${f.toUpperCase()}](${target.displayAvatarURL({ extension: f, size: 1024 })})`).join(' | ');

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🖼️ Avatar de ${target.tag}`)
      .setImage(target.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setDescription(links)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

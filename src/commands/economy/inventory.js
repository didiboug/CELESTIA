const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
  name: 'inventory',
  aliases: ['inv', 'inventaire'],
  description: 'Voir ton inventaire',
  usage: '+inventory [@membre]',
  category: 'economy',
  requiresDb: true,
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const userData = await User.findOne({ userId: target.id, guildId: message.guild.id });

    const inventory = userData?.economy?.inventory || [];

    if (inventory.length === 0) {
      return message.reply({ embeds: [new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🎒 Inventaire de ${target.tag}`)
        .setDescription('L\'inventaire est vide.\nAchète des articles dans la `+shop` !')
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .setTimestamp()] });
    }

    const list = inventory.map(item =>
      `${item.emoji || '📦'} **${item.itemName}** × ${item.quantity}`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🎒 Inventaire de ${target.tag}`)
      .setDescription(list)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `${inventory.reduce((acc, i) => acc + i.quantity, 0)} objet(s) au total` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

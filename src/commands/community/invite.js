const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
  name: 'invite',
  aliases: ['invites', 'invitations'],
  description: 'Voir tes statistiques d\'invitation',
  usage: '+invite [@membre]',
  category: 'community',
  requiresDb: true,
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const userData = await User.findOne({ userId: target.id, guildId: message.guild.id });

    const invites = userData?.invites || {};
    const regular = invites.regular || 0;
    const bonus = invites.bonus || 0;
    const fake = invites.fake || 0;
    const left = invites.left || 0;
    const total = regular + bonus - fake - left;

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📨 Invitations de ${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '📊 Total', value: `**${total}** invitation(s)`, inline: true },
        { name: '✅ Régulières', value: `${regular}`, inline: true },
        { name: '⭐ Bonus', value: `${bonus}`, inline: true },
        { name: '🚫 Fausses', value: `${fake}`, inline: true },
        { name: '👋 Partis', value: `${left}`, inline: true },
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

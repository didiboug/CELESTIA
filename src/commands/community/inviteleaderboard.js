const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
  name: 'inviteleaderboard',
  aliases: ['invlb', 'invitetop'],
  description: 'Classement des invitations du serveur',
  usage: '+inviteleaderboard',
  category: 'community',
  requiresDb: true,
  cooldown: 10,

  async execute(message, args, client) {
    const users = await User.find({ guildId: message.guild.id })
      .sort({ 'invites.total': -1 })
      .limit(10);

    if (!users.length) return message.reply({ content: 'Aucune donnée d\'invitation trouvée.' });

    const list = await Promise.all(users.map(async (u, i) => {
      const user = await client.users.fetch(u.userId).catch(() => null);
      const name = user ? user.tag : `ID: ${u.userId}`;
      const total = (u.invites?.regular || 0) + (u.invites?.bonus || 0) - (u.invites?.fake || 0) - (u.invites?.left || 0);
      const medals = ['🥇', '🥈', '🥉'];
      return `${medals[i] || `**${i + 1}.**`} ${name} — **${total}** invitation(s)`;
    }));

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📨 Classement des invitations — ${message.guild.name}`)
      .setDescription(list.join('\n'))
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

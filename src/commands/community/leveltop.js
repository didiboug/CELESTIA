const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
  name: 'leveltop',
  aliases: ['ltop', 'niveautop', 'xptop'],
  description: 'Classement des niveaux',
  usage: '+leveltop',
  category: 'community',
  requiresDb: true,
  cooldown: 10,

  async execute(message, args, client) {
    const users = await User.find({ guildId: message.guild.id })
      .sort({ 'levels.totalXp': -1 })
      .limit(10);

    if (!users.length) return message.reply({ content: 'Aucun utilisateur avec de l\'XP.' });

    const medals = ['🥇', '🥈', '🥉'];
    const list = await Promise.all(users.map(async (u, i) => {
      const user = await client.users.fetch(u.userId).catch(() => null);
      const name = user ? user.tag : `ID: ${u.userId}`;
      return `${medals[i] || `**${i + 1}.**`} ${name} — Niveau **${u.levels?.level || 0}** | **${(u.levels?.totalXp || 0).toLocaleString('fr-FR')} XP**`;
    }));

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`⭐ Classement des niveaux — ${message.guild.name}`)
      .setDescription(list.join('\n'))
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

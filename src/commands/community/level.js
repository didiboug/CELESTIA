const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const { xpRequiredForLevel } = require('../../utils/levelSystem');

module.exports = {
  name: 'level',
  aliases: ['lvl', 'rank', 'xp', 'niveau'],
  description: 'Voir ton niveau et ton XP',
  usage: '+level [@membre]',
  category: 'community',
  requiresDb: true,
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const userData = await User.findOne({ userId: target.id, guildId: message.guild.id });

    const level = userData?.levels?.level || 0;
    const xp = userData?.levels?.xp || 0;
    const totalXp = userData?.levels?.totalXp || 0;
    const messages = userData?.levels?.messages || 0;
    const xpRequired = xpRequiredForLevel(level);
    const percent = Math.min(Math.floor((xp / xpRequired) * 100), 100);

    const barFilled = Math.floor(percent / 10);
    const bar = '▓'.repeat(barFilled) + '░'.repeat(10 - barFilled);

    // Rang sur le serveur
    const allUsers = await User.find({ guildId: message.guild.id }).sort({ 'levels.totalXp': -1 });
    const rank = allUsers.findIndex(u => u.userId === target.id) + 1;

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`⭐ Niveau de ${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🎯 Niveau', value: `**${level}**`, inline: true },
        { name: '🏅 Rang', value: `**#${rank}**`, inline: true },
        { name: '💬 Messages', value: `**${messages.toLocaleString('fr-FR')}**`, inline: true },
        { name: `📊 XP — ${xp.toLocaleString('fr-FR')} / ${xpRequired.toLocaleString('fr-FR')}`,
          value: `\`${bar}\` **${percent}%**` },
        { name: '💎 XP Total', value: `${totalXp.toLocaleString('fr-FR')} XP`, inline: true },
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

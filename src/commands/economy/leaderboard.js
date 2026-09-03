const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
  name: 'leaderboard',
  aliases: ['lb', 'top', 'richesse'],
  description: 'Classement des membres les plus riches',
  usage: '+leaderboard',
  category: 'economy',
  requiresDb: true,
  cooldown: 10,

  async execute(message, args, client) {
    const users = await User.find({ guildId: message.guild.id })
      .sort({ $expr: { $add: ['$economy.wallet', '$economy.bank'] } })
      .limit(10);

    // Trier par richesse totale
    const sorted = users
      .map(u => ({ userId: u.userId, total: (u.economy.wallet || 0) + (u.economy.bank || 0) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    if (sorted.length === 0) {
      return message.reply({ content: 'Aucun utilisateur trouvé.' });
    }

    const medals = ['🥇', '🥈', '🥉'];
    const list = await Promise.all(sorted.map(async (entry, i) => {
      const user = await client.users.fetch(entry.userId).catch(() => null);
      const name = user ? user.tag : `ID: ${entry.userId}`;
      const medal = medals[i] || `**${i + 1}.**`;
      return `${medal} ${name} — **${entry.total.toLocaleString('fr-FR')} 💵**`;
    }));

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`🏆 Classement des richesses — ${message.guild.name}`)
      .setDescription(list.join('\n'))
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

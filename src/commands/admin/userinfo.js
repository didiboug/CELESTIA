const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  aliases: ['ui', 'whois', 'info'],
  description: 'Informations sur un membre',
  usage: '+userinfo [@membre]',
  category: 'admin',
  cooldown: 5,

  async execute(message, args, client) {
    const member = message.mentions.members.first()
      || (args[0] ? message.guild.members.cache.get(args[0]) : null)
      || message.member;

    const user = member.user;
    const roles = member.roles.cache
      .filter(r => r.id !== message.guild.id)
      .sort((a, b) => b.position - a.position)
      .first(10)
      .map(r => `${r}`)
      .join(' ') || 'Aucun';

    const flags = user.flags?.toArray() || [];
    const badges = {
      Staff: '🛡️ Staff Discord',
      Partner: '🤝 Partenaire',
      HypeSquadOnlineHouse1: '🏠 HypeSquad Bravery',
      HypeSquadOnlineHouse2: '🏠 HypeSquad Brilliance',
      HypeSquadOnlineHouse3: '🏠 HypeSquad Balance',
      BugHunterLevel1: '🐛 Bug Hunter',
      ActiveDeveloper: '👨‍💻 Développeur Actif',
      VerifiedBotDeveloper: '✅ Développeur Bot',
      PremiumEarlySupporter: '⭐ Early Supporter',
    };

    const embed = new EmbedBuilder()
      .setColor(member.displayHexColor || '#5865F2')
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '🤖 Bot', value: user.bot ? 'Oui' : 'Non', inline: true },
        { name: '📅 Compte créé', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '📥 Rejoint le', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: '🔝 Rôle le plus haut', value: `${member.roles.highest}`, inline: true },
        { name: `🎭 Rôles (${member.roles.cache.size - 1})`, value: roles, inline: false },
        flags.length > 0 ? { name: '🏅 Badges', value: flags.map(f => badges[f] || f).join(', '), inline: false } : null,
      ).filter(Boolean)
      .setTimestamp();

    if (member.premiumSinceTimestamp) {
      embed.addFields({ name: '⚡ Boost depuis', value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`, inline: true });
    }

    message.reply({ embeds: [embed] });
  },
};

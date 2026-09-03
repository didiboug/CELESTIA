const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const Guild = require('../models/Guild');

module.exports = {
  name: 'guildBanRemove',
  async execute(ban, client) {
    if (!client.dbConnected) return;

    const guildData = await Guild.findOne({ guildId: ban.guild.id }).catch(() => null);
    const channelId = guildData?.logs?.modLogs;
    if (!channelId) return;

    const logChannel = ban.guild.channels.cache.get(channelId);
    if (!logChannel) return;

    let moderator = null;
    try {
      const audit = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
      const entry = audit.entries.first();
      if (entry && entry.target?.id === ban.user.id && Date.now() - entry.createdTimestamp < 5000) {
        moderator = entry.executor;
      }
    } catch {}

    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('✅ Membre débanni')
      .addFields(
        { name: '👤 Débanni', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
        { name: '🛡️ Modérateur', value: moderator ? `${moderator.tag}` : 'Inconnu', inline: true },
      )
      .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(() => {});
  },
};

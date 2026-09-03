const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const Guild = require('../models/Guild');

module.exports = {
  name: 'guildBanAdd',
  async execute(ban, client) {
    if (!client.dbConnected) return;

    const guildData = await Guild.findOne({ guildId: ban.guild.id }).catch(() => null);
    const channelId = guildData?.logs?.modLogs;
    if (!channelId) return;

    const logChannel = ban.guild.channels.cache.get(channelId);
    if (!logChannel) return;

    let moderator = null;
    let reason = ban.reason || 'Aucune raison fournie';

    try {
      const audit = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
      const entry = audit.entries.first();
      if (entry && entry.target?.id === ban.user.id && Date.now() - entry.createdTimestamp < 5000) {
        moderator = entry.executor;
        reason = entry.reason || reason;
      }
    } catch {}

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('🔨 Membre banni')
      .addFields(
        { name: '👤 Banni', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
        { name: '🛡️ Modérateur', value: moderator ? `${moderator.tag}` : 'Inconnu', inline: true },
        { name: '📝 Raison', value: reason },
      )
      .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(() => {});
  },
};

const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const Guild = require('../models/Guild');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember, client) {
    if (!client.dbConnected) return;

    const guildData = await Guild.findOne({ guildId: newMember.guild.id }).catch(() => null);
    if (!guildData) return;

    // ── BOOST LOGS ───────────────────────────────────
    const boostChannelId = guildData?.logs?.boostLogs;
    const wasBoost = oldMember.premiumSince === null && newMember.premiumSince !== null;
    const lostBoost = oldMember.premiumSince !== null && newMember.premiumSince === null;

    if (boostChannelId && (wasBoost || lostBoost)) {
      const boostChannel = newMember.guild.channels.cache.get(boostChannelId);
      if (boostChannel) {
        const embed = new EmbedBuilder()
          .setColor(wasBoost ? '#FF73FA' : '#747F8D')
          .setTitle(wasBoost ? '🚀 Nouveau boost !' : '💨 Boost retiré')
          .setDescription(wasBoost
            ? `**${newMember.user.tag}** vient de booster le serveur ! 🎉\nTotal : **${newMember.guild.premiumSubscriptionCount}** boost(s)`
            : `**${newMember.user.tag}** a retiré son boost.`)
          .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
          .setTimestamp();
        boostChannel.send({ embeds: [embed] }).catch(() => {});
      }
    }

    // ── RÔLE LOGS ────────────────────────────────────
    const roleChannelId = guildData?.logs?.roleLogs;
    if (!roleChannelId) return;

    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    const added   = newRoles.filter(r => !oldRoles.has(r.id));
    const removed = oldRoles.filter(r => !newRoles.has(r.id));

    if (added.size === 0 && removed.size === 0) return;

    const roleChannel = newMember.guild.channels.cache.get(roleChannelId);
    if (!roleChannel) return;

    // Audit log pour savoir qui a modifié les rôles
    let moderator = null;
    try {
      const audit = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate, limit: 1 });
      const entry = audit.entries.first();
      if (entry && entry.target?.id === newMember.id && Date.now() - entry.createdTimestamp < 5000) {
        moderator = entry.executor;
      }
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(added.size > 0 ? '#57F287' : '#ED4245')
      .setTitle(added.size > 0 ? '🟢 Rôle(s) ajouté(s)' : '🔴 Rôle(s) retiré(s)')
      .addFields(
        { name: '👤 Membre', value: `${newMember.user.tag} (${newMember.id})`, inline: true },
        { name: '🛡️ Par', value: moderator ? moderator.tag : 'Inconnu', inline: true },
        ...(added.size > 0   ? [{ name: '✅ Ajouté(s)',  value: added.map(r => `<@&${r.id}>`).join(', ') }] : []),
        ...(removed.size > 0 ? [{ name: '❌ Retiré(s)', value: removed.map(r => `<@&${r.id}>`).join(', ') }] : []),
      )
      .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `ID membre : ${newMember.id}` })
      .setTimestamp();

    roleChannel.send({ embeds: [embed] }).catch(() => {});
  },
};

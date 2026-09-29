const { EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');
const { findLogChannels, sendToLogChannels } = require('../utils/logChannel');

module.exports = {
  name: 'channelUpdate',
  async execute(oldChannel, newChannel, client) {
    if (!client.dbConnected || !newChannel.guild) return;

    const changes = [];
    if (oldChannel.name !== newChannel.name) {
      changes.push(`**Nom :** \`${oldChannel.name}\` → \`${newChannel.name}\``);
    }
    if (oldChannel.parentId !== newChannel.parentId) {
      changes.push('**Catégorie :** modifiée');
    }
    if ('topic' in oldChannel && oldChannel.topic !== newChannel.topic) {
      changes.push('**Sujet :** modifié');
    }
    if ('nsfw' in oldChannel && oldChannel.nsfw !== newChannel.nsfw) {
      changes.push(`**NSFW :** ${newChannel.nsfw ? 'activé' : 'désactivé'}`);
    }
    if (!changes.length) return;

    const guildData = await Guild.findOne({ guildId: newChannel.guild.id }).catch(() => null);
    const logChannels = findLogChannels(
      newChannel.guild,
      guildData?.logs?.channelLogs,
      ['channel-logs', 'salon-logs'],
      guildData?.logs?.generalLogs
    );
    if (!logChannels.length) return;

    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle('✏️ Salon modifié')
      .setDescription(changes.join('\n'))
      .addFields(
        { name: '📌 Salon', value: `<#${newChannel.id}>`, inline: true },
        { name: '🆔 ID', value: newChannel.id, inline: true },
      )
      .setTimestamp();

    await sendToLogChannels(logChannels, { embeds: [embed] }, 'channel-logs');
  },
};
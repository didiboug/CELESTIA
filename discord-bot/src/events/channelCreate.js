const { EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');
const { findLogChannels, sendToLogChannels } = require('../utils/logChannel');

module.exports = {
  name: 'channelCreate',
  async execute(channel, client) {
    if (!client.dbConnected || !channel.guild) return;

    const guildData = await Guild.findOne({ guildId: channel.guild.id }).catch(() => null);
    const logChannels = findLogChannels(
      channel.guild,
      guildData?.logs?.channelLogs,
      ['channel-logs', 'salon-logs'],
      guildData?.logs?.generalLogs
    );
    if (!logChannels.length) return;

    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('📁 Salon créé')
      .setDescription(`Le salon ${channel} a été créé.`)
      .addFields(
        { name: '📌 Nom', value: `#${channel.name}`, inline: true },
        { name: '🆔 ID', value: channel.id, inline: true },
        { name: '📂 Type', value: channel.type.toString(), inline: true },
      )
      .setTimestamp();

    await sendToLogChannels(logChannels, { embeds: [embed] }, 'channel-logs');
  },
};
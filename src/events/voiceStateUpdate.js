const { EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');
const { findLogChannels, sendToLogChannels } = require('../utils/logChannel');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    if (!client.dbConnected) return;
    const member = newState.member || oldState.member;
    const guild = newState.guild || oldState.guild;
    if (!member?.user || !guild || member.user.bot) return;

    const guildData = await Guild.findOne({ guildId: guild.id }).catch(() => null);
    const logChannels = findLogChannels(
      guild,
      guildData?.logs?.voiceLogs,
      ['voice-logs', 'vocal-logs'],
      guildData?.logs?.generalLogs
    );
    if (!logChannels.length) return;

    let title, color, description;

    if (!oldState.channel && newState.channel) {
      // Rejoint un vocal
      title = '🔊 Salon vocal rejoint';
      color = '#57F287';
      description = `**${member.user.tag}** a rejoint **${newState.channel.name}**`;
    } else if (oldState.channel && !newState.channel) {
      // Quitté un vocal
      title = '🔇 Salon vocal quitté';
      color = '#ED4245';
      description = `**${member.user.tag}** a quitté **${oldState.channel.name}**`;
    } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
      // Changement de salon
      title = '🔀 Changement de salon vocal';
      color = '#FEE75C';
      description = `**${member.user.tag}** est passé de **${oldState.channel.name}** → **${newState.channel.name}**`;
    } else if (!oldState.selfMute && newState.selfMute) {
      title = '🔇 Micro coupé';
      color = '#747F8D';
      description = `**${member.user.tag}** a coupé son micro dans **${newState.channel?.name || oldState.channel?.name || 'un salon vocal'}**`;
    } else if (oldState.selfMute && !newState.selfMute) {
      title = '🎙️ Micro activé';
      color = '#5865F2';
      description = `**${member.user.tag}** a activé son micro dans **${newState.channel?.name || oldState.channel?.name || 'un salon vocal'}**`;
    } else if (!oldState.selfDeaf && newState.selfDeaf) {
      title = '🔕 Casque coupé';
      color = '#747F8D';
      description = `**${member.user.tag}** s'est mis sourd dans **${newState.channel?.name || oldState.channel?.name || 'un salon vocal'}**`;
    } else if (oldState.selfDeaf && !newState.selfDeaf) {
      title = '🔔 Casque activé';
      color = '#5865F2';
      description = `**${member.user.tag}** s'est remis son casque dans **${newState.channel?.name || oldState.channel?.name || 'un salon vocal'}**`;
    } else {
      return; // Autre changement non pertinent
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(description)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `ID : ${member.id}` })
      .setTimestamp();

    await sendToLogChannels(logChannels, { embeds: [embed] }, 'voice-logs');
  },
};

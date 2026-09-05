const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const Guild = require('../models/Guild');
const { findLogChannel } = require('../utils/logChannel');

module.exports = {
  name: 'messageDelete',
  async execute(message, client) {
    if (!client.dbConnected) return;
    if (!message.guild) return;
    if (message.author?.bot) return;

    const guildData = await Guild.findOne({ guildId: message.guild.id }).catch(() => null);
    const logChannel = findLogChannel(
      message.guild,
      guildData?.logs?.msgLogs,
      ['msg-logs', 'message-logs']
    );
    if (!logChannel) return;

    // Cherche qui a supprimé dans l'audit log
    let deletedBy = null;
    try {
      const audit = await message.guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 });
      const entry = audit.entries.first();
      if (entry && entry.target?.id === message.author?.id && Date.now() - entry.createdTimestamp < 5000) {
        deletedBy = entry.executor;
      }
    } catch {}

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('🗑️ Message supprimé')
      .addFields(
        { name: '👤 Auteur', value: message.author ? `${message.author.tag} (${message.author.id})` : 'Inconnu', inline: true },
        { name: '📌 Salon', value: `<#${message.channel.id}>`, inline: true },
        { name: '🔨 Supprimé par', value: deletedBy ? `${deletedBy.tag}` : 'L\'auteur lui-même', inline: true },
        { name: '💬 Contenu', value: message.content ? message.content.slice(0, 1024) : '*Aucun texte (image/embed)*' },
      )
      .setThumbnail(message.author?.displayAvatarURL({ dynamic: true }) || null)
      .setFooter({ text: `ID message : ${message.id}` })
      .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(error => {
      console.error(`❌ Envoi msg-logs impossible: ${error.message}`);
    });
  },
};

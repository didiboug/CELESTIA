const { EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage, client) {
    if (!client.dbConnected) return;
    if (!newMessage.guild) return;
    if (newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return; // Ignorer les embeds ajoutés

    const guildData = await Guild.findOne({ guildId: newMessage.guild.id }).catch(() => null);
    const channelId = guildData?.logs?.msgLogs;
    if (!channelId) return;

    const logChannel = newMessage.guild.channels.cache.get(channelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle('✏️ Message modifié')
      .setURL(newMessage.url)
      .addFields(
        { name: '👤 Auteur', value: `${newMessage.author.tag} (${newMessage.author.id})`, inline: true },
        { name: '📌 Salon', value: `<#${newMessage.channel.id}>`, inline: true },
        { name: '🔗 Lien', value: `[Voir le message](${newMessage.url})`, inline: true },
        { name: '❌ Avant', value: oldMessage.content?.slice(0, 512) || '*Vide*' },
        { name: '✅ Après', value: newMessage.content?.slice(0, 512) || '*Vide*' },
      )
      .setThumbnail(newMessage.author.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `ID message : ${newMessage.id}` })
      .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(() => {});
  },
};

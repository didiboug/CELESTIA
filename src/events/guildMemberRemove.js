const { EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    if (!client.dbConnected) return;
    const guildData = await Guild.findOne({ guildId: member.guild.id });
    if (!guildData?.goodbye?.enabled || !guildData?.goodbye?.channelId) return;

    const channel = member.guild.channels.cache.get(guildData.goodbye.channelId);
    if (!channel) return;

    const msg = (guildData.goodbye.message || '{user} vient de quitter le serveur. Adieu !')
      .replace(/{user}/g, member.user.tag)
      .replace(/{username}/g, member.user.username)
      .replace(/{server}/g, member.guild.name)
      .replace(/{count}/g, member.guild.memberCount.toLocaleString('fr-FR'));

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle(`👋 Au revoir !`)
      .setDescription(msg)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Il reste ${member.guild.memberCount} membres` })
      .setTimestamp();

    await channel.send({ embeds: [embed] }).catch(() => {});
  },
};

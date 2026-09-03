const { successEmbed } = require('../../utils/embed');

module.exports = {
  name: 'unlock',
  description: 'Déverrouiller un canal',
  usage: '+unlock [#canal]',
  category: 'moderation',
  permissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 5,

  async execute(message, args, client) {
    const channel = message.mentions.channels.first() || message.channel;

    await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: null,
    });

    channel.send({ embeds: [successEmbed('Canal Déverrouillé 🔓', `Ce canal a été déverrouillé par ${message.author}.`)] });

    if (channel.id !== message.channel.id) {
      message.reply({ embeds: [successEmbed('Canal Déverrouillé', `${channel} a été déverrouillé.`)] });
    }
  },
};

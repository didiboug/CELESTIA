const { PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'lock',
  description: 'Verrouiller un canal (personne ne peut écrire)',
  usage: '+lock [#canal] [raison]',
  category: 'moderation',
  permissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 5,

  async execute(message, args, client) {
    const channel = message.mentions.channels.first() || message.channel;
    const reason = (message.mentions.channels.first() ? args.slice(1) : args).join(' ') || 'Aucune raison';

    await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: false,
    }, { reason: `${message.author.tag}: ${reason}` });

    channel.send({ embeds: [successEmbed('Canal Verrouillé 🔒', `Ce canal a été verrouillé par ${message.author}.\n📝 Raison : ${reason}`)] });

    if (channel.id !== message.channel.id) {
      message.reply({ embeds: [successEmbed('Canal Verrouillé', `${channel} a été verrouillé.`)] });
    }
  },
};

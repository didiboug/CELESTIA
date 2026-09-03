const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { sendModLog } = require('../../utils/automod');
const Guild = require('../../models/Guild');

module.exports = {
  name: 'kick',
  aliases: ['expulser'],
  description: 'Expulser un membre du serveur',
  usage: '+kick @membre [raison]',
  category: 'moderation',
  permissions: ['KickMembers'],
  botPermissions: ['KickMembers'],
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un membre à expulser.')] });

    if (target.id === message.author.id) return message.reply({ embeds: [errorEmbed('Erreur', 'Tu ne peux pas t\'expulser toi-même.')] });
    if (!target.kickable) return message.reply({ embeds: [errorEmbed('Erreur', 'Je ne peux pas expulser ce membre.')] });

    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

    await target.user.send({
      embeds: [new EmbedBuilder()
        .setColor('#FEE75C')
        .setTitle(`👢 Tu as été expulsé de ${message.guild.name}`)
        .addFields({ name: '📝 Raison', value: reason }, { name: '🛡️ Modérateur', value: message.author.tag })
        .setTimestamp()]
    }).catch(() => {});

    await target.kick(`${message.author.tag}: ${reason}`);
    await message.reply({ embeds: [successEmbed('Expulsé', `**${target.user.tag}** a été expulsé.\n📝 Raison : ${reason}`)] });

    const guildData = await Guild.findOne({ guildId: message.guild.id });
    await sendModLog(message.guild, guildData, 'KICK', message.author, target.user, reason);
  },
};

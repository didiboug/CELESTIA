const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { sendModLog } = require('../../utils/automod');
const Guild = require('../../models/Guild');

module.exports = {
  name: 'ban',
  aliases: ['bannir'],
  description: 'Bannir un membre du serveur',
  usage: '+ban @membre [raison]',
  category: 'moderation',
  permissions: ['BanMembers'],
  botPermissions: ['BanMembers'],
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un membre à bannir.')] });

    if (target.id === message.author.id) return message.reply({ embeds: [errorEmbed('Erreur', 'Tu ne peux pas te bannir toi-même.')] });
    if (!target.bannable) return message.reply({ embeds: [errorEmbed('Erreur', 'Je ne peux pas bannir ce membre (hiérarchie de rôles).')] });

    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

    try {
      // Prévenir l'utilisateur en DM
      await target.user.send({
        embeds: [new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle(`🔨 Tu as été banni de ${message.guild.name}`)
          .addFields(
            { name: '📝 Raison', value: reason },
            { name: '🛡️ Modérateur', value: message.author.tag }
          )
          .setTimestamp()]
      }).catch(() => {});

      await target.ban({ reason: `${message.author.tag}: ${reason}` });

      await message.reply({ embeds: [successEmbed('Banni', `**${target.user.tag}** a été banni.\n📝 Raison : ${reason}`)] });

      const guildData = await Guild.findOne({ guildId: message.guild.id });
      await sendModLog(message.guild, guildData, 'BAN', message.author, target.user, reason);
    } catch (err) {
      message.reply({ embeds: [errorEmbed('Erreur', `Impossible de bannir : ${err.message}`)] });
    }
  },
};

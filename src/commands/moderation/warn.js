const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const { sendModLog } = require('../../utils/automod');
const Guild = require('../../models/Guild');
const Warning = require('../../models/Warning');
const { v4: uuidv4 } = require('crypto');

function generateId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

module.exports = {
  name: 'warn',
  description: 'Avertir un membre',
  usage: '+warn @membre [raison]',
  category: 'moderation',
  requiresDb: true,
  permissions: ['ManageMessages'],
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un membre à avertir.')] });
    if (target.id === message.author.id) return message.reply({ embeds: [errorEmbed('Erreur', 'Tu ne peux pas t\'avertir toi-même.')] });

    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    const warnId = generateId();

    await Warning.create({
      guildId: message.guild.id,
      userId: target.id,
      moderatorId: message.author.id,
      reason,
      warnId,
    });

    const totalWarnings = await Warning.countDocuments({ guildId: message.guild.id, userId: target.id, active: true });

    // DM l'utilisateur
    await target.user.send({
      embeds: [new EmbedBuilder()
        .setColor('#FEE75C')
        .setTitle(`⚠️ Avertissement sur ${message.guild.name}`)
        .addFields(
          { name: '📝 Raison', value: reason },
          { name: '🛡️ Modérateur', value: message.author.tag },
          { name: '🆔 ID Warn', value: warnId },
          { name: '📊 Total avertissements', value: `${totalWarnings}` }
        )
        .setTimestamp()]
    }).catch(() => {});

    await message.reply({ embeds: [successEmbed('Averti', `**${target.user.tag}** a reçu un avertissement.\n📝 Raison : ${reason}\n🆔 ID : \`${warnId}\`\n📊 Total : **${totalWarnings}** avertissement(s)`)] });

    const guildData = await Guild.findOne({ guildId: message.guild.id });
    await sendModLog(message.guild, guildData, 'WARN', message.author, target.user, reason);
  },
};

const { successEmbed, errorEmbed } = require('../../utils/embed');
const { sendModLog } = require('../../utils/automod');
const Guild = require('../../models/Guild');

function parseDuration(str) {
  const match = str?.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  const n = parseInt(match[1]);
  const unit = match[2];
  const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * map[unit];
}

module.exports = {
  name: 'timeout',
  aliases: ['to'],
  description: 'Mettre en timeout un membre (natif Discord)',
  usage: '+timeout @membre <durée: 5m/1h/1d> [raison]',
  category: 'moderation',
  permissions: ['ModerateMembers'],
  botPermissions: ['ModerateMembers'],
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un membre.')] });

    const duration = parseDuration(args[1]);
    if (!duration) return message.reply({ embeds: [errorEmbed('Erreur', 'Durée invalide. Exemples : `5m`, `1h`, `1d`')] });
    if (duration > 28 * 86400000) return message.reply({ embeds: [errorEmbed('Erreur', 'La durée maximum est de 28 jours.')] });

    const reason = args.slice(2).join(' ') || 'Aucune raison fournie';

    await target.timeout(duration, `${message.author.tag}: ${reason}`);
    await message.reply({ embeds: [successEmbed('Timeout', `**${target.user.tag}** est en timeout pour **${args[1]}**.\n📝 Raison : ${reason}`)] });

    const guildData = await Guild.findOne({ guildId: message.guild.id });
    await sendModLog(message.guild, guildData, 'TIMEOUT', message.author, target.user, reason, { duration: args[1] });
  },
};

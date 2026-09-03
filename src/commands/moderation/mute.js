const { EmbedBuilder } = require('discord.js');
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
  name: 'mute',
  aliases: ['silence'],
  description: 'Mettre en sourdine un membre (rôle mute)',
  usage: '+mute @membre [durée: 10m/1h/1d] [raison]',
  category: 'moderation',
  requiresDb: true,
  permissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un membre à mute.')] });

    const guildData = await Guild.findOne({ guildId: message.guild.id });
    if (!guildData?.muteRoleId) {
      return message.reply({ embeds: [errorEmbed('Erreur', 'Aucun rôle mute configuré. Utilise `+setup mute` ou configure-le manuellement.')] });
    }

    const muteRole = message.guild.roles.cache.get(guildData.muteRoleId);
    if (!muteRole) return message.reply({ embeds: [errorEmbed('Erreur', 'Le rôle mute est introuvable.')] });

    let argsIndex = 1;
    const duration = parseDuration(args[argsIndex]);
    if (duration) argsIndex++;
    const reason = args.slice(argsIndex).join(' ') || 'Aucune raison fournie';

    await target.roles.add(muteRole, `${message.author.tag}: ${reason}`);

    if (duration) {
      setTimeout(async () => {
        await target.roles.remove(muteRole, 'Durée du mute expirée').catch(() => {});
      }, duration);
    }

    const durationText = duration
      ? `Durée : ${args[1]}`
      : 'Durée : Indéfinie (utilise +unmute pour retirer)';

    await message.reply({ embeds: [successEmbed('Mute', `**${target.user.tag}** a été mis en sourdine.\n📝 Raison : ${reason}\n⏱️ ${durationText}`)] });
    await sendModLog(message.guild, guildData, 'MUTE', message.author, target.user, reason, { duration: durationText });
  },
};

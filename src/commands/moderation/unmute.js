const { successEmbed, errorEmbed } = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  name: 'unmute',
  description: 'Retirer le mute d\'un membre',
  usage: '+unmute @membre',
  category: 'moderation',
  requiresDb: true,
  permissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un membre.')] });

    const guildData = await Guild.findOne({ guildId: message.guild.id });
    if (!guildData?.muteRoleId) return message.reply({ embeds: [errorEmbed('Erreur', 'Aucun rôle mute configuré.')] });

    const muteRole = message.guild.roles.cache.get(guildData.muteRoleId);
    if (!muteRole) return message.reply({ embeds: [errorEmbed('Erreur', 'Rôle mute introuvable.')] });

    if (!target.roles.cache.has(muteRole.id)) {
      return message.reply({ embeds: [errorEmbed('Erreur', `**${target.user.tag}** n'est pas mute.`)] });
    }

    await target.roles.remove(muteRole);
    message.reply({ embeds: [successEmbed('Unmute', `**${target.user.tag}** n'est plus en sourdine.`)] });
  },
};

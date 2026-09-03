const { successEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'nick',
  aliases: ['nickname', 'setnick'],
  description: 'Changer le pseudo d\'un membre',
  usage: '+nick @membre [nouveau pseudo]',
  category: 'moderation',
  permissions: ['ManageNicknames'],
  botPermissions: ['ManageNicknames'],
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un membre.')] });

    const newNick = args.slice(1).join(' ') || null;

    if (target.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply({ embeds: [errorEmbed('Erreur', 'Je ne peux pas modifier le pseudo de ce membre.')] });
    }

    const oldNick = target.displayName;
    await target.setNickname(newNick, `Modifié par ${message.author.tag}`);

    if (newNick) {
      message.reply({ embeds: [successEmbed('Pseudo modifié', `**${oldNick}** → **${newNick}**`)] });
    } else {
      message.reply({ embeds: [successEmbed('Pseudo réinitialisé', `Le pseudo de **${target.user.tag}** a été réinitialisé.`)] });
    }
  },
};

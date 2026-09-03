const { successEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'unban',
  description: 'Débannir un utilisateur',
  usage: '+unban <userId> [raison]',
  category: 'admin',
  permissions: ['BanMembers'],
  botPermissions: ['BanMembers'],
  cooldown: 5,

  async execute(message, args, client) {
    const userId = args[0];
    if (!userId) return message.reply({ embeds: [errorEmbed('Erreur', 'Précise l\'ID de l\'utilisateur à débannir.')] });

    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

    try {
      const bannedUser = await message.guild.bans.fetch(userId).catch(() => null);
      if (!bannedUser) return message.reply({ embeds: [errorEmbed('Erreur', 'Cet utilisateur n\'est pas banni.')] });

      await message.guild.members.unban(userId, reason);
      message.reply({ embeds: [successEmbed('Débanni', `**${bannedUser.user.tag}** a été débanni.\n📝 Raison : ${reason}`)] });
    } catch (err) {
      message.reply({ embeds: [errorEmbed('Erreur', `Impossible de débannir : ${err.message}`)] });
    }
  },
};

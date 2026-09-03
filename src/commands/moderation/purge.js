const { successEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'purge',
  description: 'Supprimer les messages d\'un utilisateur spécifique',
  usage: '+purge @membre [nombre]',
  category: 'moderation',
  permissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  cooldown: 5,

  async execute(message, args, client) {
    await message.delete().catch(() => {});

    const target = message.mentions.users.first();
    if (!target) return message.channel.send({ embeds: [errorEmbed('Erreur', 'Mentionne un membre dont supprimer les messages.')] }).then(m => setTimeout(() => m.delete().catch(() => {}), 4000));

    const limit = Math.min(parseInt(args[1]) || 50, 100);
    const messages = await message.channel.messages.fetch({ limit: 100 });

    const toDelete = messages
      .filter(m => m.author.id === target.id && Date.now() - m.createdTimestamp < 1209600000)
      .first(limit);

    if (!toDelete.length) {
      return message.channel.send({ embeds: [errorEmbed('Aucun message', `${target.tag} n'a aucun message récent.`)] }).then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
    }

    const deleted = await message.channel.bulkDelete(toDelete, true);
    const msg = await message.channel.send({ embeds: [successEmbed('Purge effectuée', `**${deleted.size}** message(s) de **${target.tag}** supprimé(s).`)] });
    setTimeout(() => msg.delete().catch(() => {}), 5000);
  },
};

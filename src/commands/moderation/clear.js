const { successEmbed, errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'clear',
  aliases: ['purge', 'del'],
  description: 'Supprimer des messages en masse',
  usage: '+clear <nombre 1-100> [@membre]',
  category: 'moderation',
  permissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  cooldown: 5,

  async execute(message, args, client) {
    await message.delete().catch(() => {});

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.channel.send({ embeds: [errorEmbed('Erreur', 'Précise un nombre entre 1 et 100.')] })
        .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
    }

    const filterUser = message.mentions.users.first();

    let messages = await message.channel.messages.fetch({ limit: 100 });

    // Filtrer les messages trop vieux (>14j Discord ne peut pas les supprimer en masse)
    messages = messages.filter(m => {
      const age = Date.now() - m.createdTimestamp;
      return age < 1209600000; // 14 jours
    });

    if (filterUser) {
      messages = messages.filter(m => m.author.id === filterUser.id);
    }

    messages = [...messages.values()].slice(0, amount);

    if (messages.length === 0) {
      return message.channel.send({ embeds: [errorEmbed('Erreur', 'Aucun message récent à supprimer.')] })
        .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
    }

    const deleted = await message.channel.bulkDelete(messages, true);

    const confirm = await message.channel.send({
      embeds: [successEmbed('Messages supprimés', `**${deleted.size}** message(s) supprimé(s)${filterUser ? ` de ${filterUser.tag}` : ''}.`)]
    });
    setTimeout(() => confirm.delete().catch(() => {}), 5000);
  },
};

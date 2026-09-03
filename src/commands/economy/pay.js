const { successEmbed, errorEmbed } = require('../../utils/embed');
const User = require('../../models/User');

module.exports = {
  name: 'pay',
  aliases: ['give', 'donner'],
  description: 'Donner de l\'argent à un membre',
  usage: '+pay @membre <montant>',
  category: 'economy',
  requiresDb: true,
  cooldown: 10,

  async execute(message, args, client) {
    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un membre.')] });
    if (targetUser.id === message.author.id) return message.reply({ embeds: [errorEmbed('Erreur', 'Tu ne peux pas te donner de l\'argent à toi-même.')] });
    if (targetUser.bot) return message.reply({ embeds: [errorEmbed('Erreur', 'Tu ne peux pas payer un bot.')] });

    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) return message.reply({ embeds: [errorEmbed('Erreur', 'Indique un montant valide.')] });

    const senderData = await User.findOneAndUpdate({ userId: message.author.id, guildId: message.guild.id }, {}, { upsert: true, new: true });
    if (senderData.economy.wallet < amount) {
      return message.reply({ embeds: [errorEmbed('Fonds insuffisants', `Tu n'as que **${senderData.economy.wallet.toLocaleString('fr-FR')} 💵**.`)] });
    }

    const receiverData = await User.findOneAndUpdate({ userId: targetUser.id, guildId: message.guild.id }, {}, { upsert: true, new: true });

    senderData.economy.wallet -= amount;
    receiverData.economy.wallet += amount;
    await Promise.all([senderData.save(), receiverData.save()]);

    message.reply({ embeds: [successEmbed('Paiement effectué', `Tu as envoyé **${amount.toLocaleString('fr-FR')} 💵** à ${targetUser} !`)] });
  },
};

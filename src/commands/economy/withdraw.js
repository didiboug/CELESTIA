const { successEmbed, errorEmbed } = require('../../utils/embed');
const User = require('../../models/User');

module.exports = {
  name: 'withdraw',
  aliases: ['with', 'retrait'],
  description: 'Retirer de l\'argent de la banque',
  usage: '+withdraw <montant|all>',
  category: 'economy',
  requiresDb: true,
  cooldown: 5,

  async execute(message, args, client) {
    const userData = await User.findOneAndUpdate(
      { userId: message.author.id, guildId: message.guild.id },
      {},
      { upsert: true, new: true }
    );

    const bank = userData.economy.bank;
    let amount;

    if (args[0]?.toLowerCase() === 'all' || args[0]?.toLowerCase() === 'tout') {
      amount = bank;
    } else {
      amount = parseInt(args[0]);
      if (isNaN(amount) || amount <= 0) return message.reply({ embeds: [errorEmbed('Erreur', 'Indique un montant valide ou `all`.')] });
    }

    if (amount > bank) return message.reply({ embeds: [errorEmbed('Fonds insuffisants', `Tu n'as que **${bank.toLocaleString('fr-FR')} 💵** en banque.`)] });

    userData.economy.bank -= amount;
    userData.economy.wallet += amount;
    await userData.save();

    message.reply({ embeds: [successEmbed('Retrait effectué', `Tu as retiré **${amount.toLocaleString('fr-FR')} 💵** de ta banque.\n👛 Portefeuille : **${userData.economy.wallet.toLocaleString('fr-FR')} 💵**`)] });
  },
};

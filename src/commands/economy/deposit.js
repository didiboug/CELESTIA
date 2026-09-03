const { successEmbed, errorEmbed } = require('../../utils/embed');
const User = require('../../models/User');
const config = require('../../config');

module.exports = {
  name: 'deposit',
  aliases: ['dep'],
  description: 'Déposer de l\'argent en banque',
  usage: '+deposit <montant|all>',
  category: 'economy',
  requiresDb: true,
  cooldown: 5,

  async execute(message, args, client) {
    const userData = await User.findOneAndUpdate(
      { userId: message.author.id, guildId: message.guild.id },
      {},
      { upsert: true, new: true }
    );

    const wallet = userData.economy.wallet;
    let amount;

    if (args[0]?.toLowerCase() === 'all' || args[0]?.toLowerCase() === 'tout') {
      amount = wallet;
    } else {
      amount = parseInt(args[0]);
      if (isNaN(amount) || amount <= 0) {
        return message.reply({ embeds: [errorEmbed('Erreur', 'Indique un montant valide ou `all`.')] });
      }
    }

    if (amount > wallet) {
      return message.reply({ embeds: [errorEmbed('Fonds insuffisants', `Tu n'as que **${wallet.toLocaleString('fr-FR')} 💵** dans ton portefeuille.`)] });
    }

    const maxBank = config.economy.maxBankSize;
    if (userData.economy.bank + amount > maxBank) {
      const canDeposit = maxBank - userData.economy.bank;
      if (canDeposit <= 0) return message.reply({ embeds: [errorEmbed('Banque pleine', `Ta banque est à son maximum (${maxBank.toLocaleString('fr-FR')} 💵).`)] });
      amount = canDeposit;
    }

    userData.economy.wallet -= amount;
    userData.economy.bank += amount;
    await userData.save();

    message.reply({ embeds: [successEmbed('Dépôt effectué', `Tu as déposé **${amount.toLocaleString('fr-FR')} 💵** en banque.\n🏦 Banque : **${userData.economy.bank.toLocaleString('fr-FR')} 💵**`)] });
  },
};

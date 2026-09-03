const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
  name: 'balance',
  aliases: ['bal', 'money', 'argent'],
  description: 'Voir ton solde ou celui d\'un membre',
  usage: '+balance [@membre]',
  category: 'economy',
  requiresDb: true,
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.users.first()
      || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null)
      || message.author;

    const userData = await User.findOneAndUpdate(
      { userId: target.id, guildId: message.guild.id },
      {},
      { upsert: true, new: true }
    );

    const wallet = userData.economy.wallet || 0;
    const bank = userData.economy.bank || 0;
    const total = wallet + bank;

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`💰 Solde de ${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👛 Portefeuille', value: `${wallet.toLocaleString('fr-FR')} 💵`, inline: true },
        { name: '🏦 Banque', value: `${bank.toLocaleString('fr-FR')} 💵`, inline: true },
        { name: '💎 Total', value: `${total.toLocaleString('fr-FR')} 💵`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

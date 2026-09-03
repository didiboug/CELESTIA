const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');
const User = require('../../models/User');
const config = require('../../config');

module.exports = {
  name: 'rob',
  aliases: ['voler'],
  description: 'Tenter de voler un membre',
  usage: '+rob @membre',
  category: 'economy',
  requiresDb: true,
  cooldown: 5,

  async execute(message, args, client) {
    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne quelqu\'un à voler.')] });
    if (targetUser.id === message.author.id) return message.reply({ embeds: [errorEmbed('Erreur', 'Tu ne peux pas te voler toi-même.')] });

    const robberData = await User.findOneAndUpdate({ userId: message.author.id, guildId: message.guild.id }, {}, { upsert: true, new: true });
    const victimData = await User.findOneAndUpdate({ userId: targetUser.id, guildId: message.guild.id }, {}, { upsert: true, new: true });

    const now = Date.now();
    const lastRob = robberData.economy.lastRob ? new Date(robberData.economy.lastRob).getTime() : 0;
    if (now - lastRob < config.economy.robCooldown) {
      const minutes = Math.floor((config.economy.robCooldown - (now - lastRob)) / 60000);
      return message.reply({ embeds: [errorEmbed('Cooldown', `Attends encore **${minutes} min** avant de tenter un autre vol.`)] });
    }

    if (victimData.economy.wallet < 50) {
      return message.reply({ embeds: [errorEmbed('Cible trop pauvre', `${targetUser.tag} n'a pas assez d'argent pour être volé.`)] });
    }

    robberData.economy.lastRob = new Date();
    const success = Math.random() < 0.45;

    if (success) {
      const stolen = Math.floor(victimData.economy.wallet * (Math.random() * 0.3 + 0.1));
      robberData.economy.wallet += stolen;
      victimData.economy.wallet -= stolen;
      await Promise.all([robberData.save(), victimData.save()]);

      return message.reply({ embeds: [new EmbedBuilder().setColor('#57F287')
        .setTitle('🦹 Vol réussi !')
        .setDescription(`Tu as volé **${stolen.toLocaleString('fr-FR')} 💵** à ${targetUser} !`)
        .setTimestamp()] });
    } else {
      const fine = Math.floor(robberData.economy.wallet * 0.15);
      robberData.economy.wallet = Math.max(0, robberData.economy.wallet - fine);
      await robberData.save();

      return message.reply({ embeds: [new EmbedBuilder().setColor('#ED4245')
        .setTitle('🚔 Vol raté !')
        .setDescription(`${targetUser} t'a surpris en train de le voler ! Tu as payé une amende de **${fine.toLocaleString('fr-FR')} 💵**.`)
        .setTimestamp()] });
    }
  },
};
